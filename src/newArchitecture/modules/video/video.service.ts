import fs from "fs";
import {fs as fsp} from "fs/promises";
import path from 'path';
import ffmpeg from "fluent-ffmpeg";
import { exec } from "child_process";

import { INC_OR_DESC, NOTIF_TYPES } from "../../shared/types";
import { getDateRangeInfo } from "../../shared/utils/getDateRangeCondition";
import { ChannelEntity } from "../channel/domain/channel.entity";
import { IChannelRepository } from "../channel/domain/channel.interface";
import { IStatisticVideoDto } from "../statistic/domain/statistic.dtos";
import { VideoStatisticEntity } from "../statistic/domain/statistic.entity";
import { IStatisticRepository } from "../statistic/domain/statistic.interface";
import { ISubscriptionRepository } from "../subscription/domain/subscription.interface";
import { TVideoTypeFilter, VIDEO_TYPE_FILTER } from "./domain/video.consts";
import { IgetVideoByIdServiceDto, IUpdateMarkVideoDto, IUpdateViewVideoDto, IVideoAnalyticDto } from "./domain/video.dtos";
import { TagEntity, VideoEntity } from "./domain/video.entity";
import { IVideoRepository, IVideoService } from "./domain/video.interface";
import { PlaylistEntity } from "../playlist/domain/playlist.entity";
import { getAverageColor } from "../../shared/utils/getAverageColor";
import { convertSrtToVTTAndCreateM3U8, createSrtSubtitleFile, getVideoDuration, sendProgress } from "./domain/video.utils";
import { INotifRepository } from "../notif/domain/notif.interface";

export class VideoService implements IVideoService{
    constructor(
        private videoRepository: IVideoRepository,
        private channelRepository: IChannelRepository,
        private statisticRepository: IStatisticRepository,
        private subscriptionRepository: ISubscriptionRepository, 
        private notifRepository: INotifRepository 
    ) {}

    async getVideos(
        tagName: string, 
        isShort: boolean, 
        channelData: string | null, 
        offset: number, 
        limit: number
    ): Promise<VideoEntity[]> {

        const parsedChannelData = JSON.parse(channelData || '')

        const tag = await this.videoRepository.getTagsByName(tagName)

        let response;

        if (tagName === "fresh") {
            response = await this.videoRepository.getOrderedVideoList("DESC", offset, limit);
        } else if (tagName === "newForMe" && parsedChannelData.id) {
            response = await this.videoRepository.getVideosByFollowedChannels(parsedChannelData.id, offset, limit);
        } else if (tagName === "viewed" && parsedChannelData.id) {
            response = await this.videoRepository.getViewedVideos(parsedChannelData.id, offset, limit);
        } else if (tagName === "all" || !tagName) {
            response = await this.videoRepository.getVideoList(offset, limit, isShort);
        } else {
            response = await this.videoRepository.getVideoListByTag(tag.id, offset, limit);
        }
        
        return response
    }

    async getVideoListBySubs(followerId: string, offset: number, limit: number, onlyShorts: boolean, onlyFull: boolean): Promise<VideoEntity[]> {
        
        let videoTypeFilter: TVideoTypeFilter

        if(onlyShorts === onlyFull) {
            videoTypeFilter = VIDEO_TYPE_FILTER.ALL
        } else {
            onlyShorts ? videoTypeFilter = VIDEO_TYPE_FILTER.ONLY_SHORTS : videoTypeFilter = VIDEO_TYPE_FILTER.ONLY_FULL 
        }

        const videos = await this.videoRepository.getVideoListBySubs(followerId, offset, limit, videoTypeFilter)
        
        return videos
    }

    async getVideoById(videoId: string, followerId: string): Promise<IgetVideoByIdServiceDto | string> {
        const video = await this.videoRepository.getVideoById(videoId as string);
    
        if (!video) {
            return 'Video not found'
        }
    
        const channel = await this.channelRepository.getChannelById(followerId);
    
        let subscriptionData = null;
        let videoStatData = null;
    
        if (channel instanceof ChannelEntity) {
            subscriptionData = await this.subscriptionRepository.getSubscriptionDataByFollowerId(channel.id, followerId);
            videoStatData = await this.statisticRepository.getVideoStatisticByFollowerId(video.id, followerId);
        }
    
        const result = {
            video: video,
            videoOwnerChannel: channel,
            subscriptionData: subscriptionData,
            videoStatData: videoStatData,
        }

        return result
    }


    async getViewedVideos(channelId: string, isShort: boolean | null, tags: string | null, offset: number, limit: number): Promise<VideoEntity[]> {
        let viewedVideos

        if (isShort) {
            viewedVideos = await this.videoRepository.getViewedShortVideosByChannelId(
                channelId,
                true,
                offset,
                limit
            );
        } else if(!isShort && !tags) {
            viewedVideos = await this.videoRepository.getViewedShortVideosByChannelId(
                channelId,
                false,
                offset,
                limit
            );
        } else if (tags === 'all') {
            viewedVideos = await this.videoRepository.getViewedVideosByChannelId(
                channelId,
                offset,
                limit
            );
        } else if (tags) {     
            const tag = await this.videoRepository.getTagsByName(tags[0])

            viewedVideos = await this.videoRepository.getViewedVideoListByTag(
                tag.id,
                offset,
                limit,
                channelId,
            );
        } else {
            viewedVideos = await this.videoRepository.getViewedVideosByChannelId(
                channelId,
                offset,
                limit
            );
        }
        return viewedVideos
    }


    async updateViewVideo(videoId: string, viewerId: string): Promise<IUpdateViewVideoDto | string> {
        const video = await this.videoRepository.getVideoById(videoId);

        if (!video) {
            return "Video not found"
        }

        const isUpdated = await this.videoRepository.updateVideoViewsById(videoId as string);

        // новая таблица для отслеживания просмотров для статистики 
        await this.videoRepository.updateVideoViewsForAnal( 
            videoId as string,
            viewerId !== 'undefined' ? viewerId : '00000000-0000-0000-0000-000000000000',
        )

        if (viewerId) {
            const statRes = await this.statisticRepository.getVideoStatisticByFollowerId(
                videoId,
                viewerId
            );

            if (statRes) {
                console.log("ОБНОВЛЯЕМ");

                await this.statisticRepository.updateVideoStatViewsCount(videoId, viewerId);
            } else {
                console.log("СОЗДАЕМ");
                await this.statisticRepository.createVideoStatForUser(
                    videoId,
                    viewerId,
                    false,
                    false
                );
            }
        }

        return {success: 'video view updated successful'}
    }

    
    async getVideoAnalytics(videoId: string, dateRange: string): Promise<IStatisticVideoDto> {
        const interval = getDateRangeInfo(dateRange);
        
        let result

        switch (interval) {
        case '1 day':
            result = await this.statisticRepository.getVideoViewsLast24Hours(videoId as string);
            break;

        case '3 days':
            result = await this.statisticRepository.getVideoViewsLast3Days(videoId as string);
            break;
        
        default:
            result = await this.statisticRepository.getVideoAnalyticsRepo(videoId as string, interval);
            break;
        }

        return result
    }

    async updateMarkVideo(videoId: string, userId: string, isLiked: boolean, isDisliked: boolean): Promise<IUpdateMarkVideoDto> {
           // Проверяем, существует ли запись статистики
        const oldStat = await this.statisticRepository.getVideoStatByUser(videoId, userId);

        let oldLiked = false;
        let oldDisliked = false;

        if (oldStat) {
            oldLiked = oldStat.liked;
            oldDisliked = oldStat.disliked;

            // Обновляем существующую запись
            await this.statisticRepository.updateVideoStatUser(
                videoId as string,
                userId,
                isDisliked,
                isLiked
            );
            } else {
            // Создаем новую запись
            await this.statisticRepository.createVideoStatForUser(
                videoId as string,
                userId,
                isDisliked,
                isLiked
            );
        }

        // Обновляем счетчики видео
        // Сначала обрабатываем лайки
        if (oldLiked !== isLiked) {
            if (isLiked) {
                await this.videoRepository.updateVideoLikes(videoId, INC_OR_DESC.INC);
            } else {
                await this.videoRepository.updateVideoLikes(videoId, INC_OR_DESC.DESC);
            }
        }

        // Обрабатываем дизлайки
        if (oldDisliked !== isDisliked) {
            if (isDisliked) {
                await this.videoRepository.updateVideoDislikes(videoId, INC_OR_DESC.INC);
            } else {
                await this.videoRepository.updateVideoDislikes(videoId, INC_OR_DESC.DESC);
            }
        }

        // Получаем обновленную статистику для ответа
        const updatedStats = await this.statisticRepository.getVideoStatByUser(videoId, userId);
        const videoData = await this.videoRepository.getVideoById(videoId)

        return {
            stats: VideoStatisticEntity.fromDbRows([updatedStats])[0],
            video: VideoEntity.fromDbRows([videoData])[0]
        }
    }

    
    async deleteVideoService(videoId: string): Promise<boolean> {
        const cwd = process.cwd();
        const folderPath = cwd + '/public/videos/' + videoId
        try {
            await fsp.rm(folderPath, { recursive: true, force: true });
            console.log(`✅ Папка ${folderPath} и всё её содержимое удалены`);
            
            const deletedVideo = await this.videoRepository.deleteVideoById(videoId)
            
            return true;
        } catch (error: any) {
            console.error(`Ошибка при удалении ${folderPath}:`, error.message);
            return false;
        }
    }


    async updateVideo(
        videoId: string, 
        iconPreview: string, 
        videoName: string, 
        videoDescription: string, 
        hashTags: [], 
        tags: [], 
        playlistIds: []
    ): Promise<VideoEntity> {

        const base64Data = iconPreview.replace(/^data:image\/\w+;base64,/, '');
        const filename = `thumb_${Date.now()}.jpg`;
        const currentDir = process.cwd()
        const thumbnailPath = currentDir + '/public' + '/videos/' + videoId + '/thumbnail'
        const thumbnailUrl = 'http://localhost:8080' + '/videos/' + videoId + '/thumbnail/' + filename

        const filepath = path.join(thumbnailPath, filename);
        
        fs.writeFile(filepath, base64Data, 'base64', (err) => {
            if (err) throw err;
            console.log('Файл сохранен:', filename)
        })

        const preparedHashtags = hashTags?.map((h: any) => h.name) || [];
        const preparedTags = tags?.map((t: TagEntity) => t.name) || [];
        const preparedPlaylistIds = playlistIds?.map((t: PlaylistEntity) => t.id) || [];

        const updatedVideo = await this.videoRepository.updateVideoById(
            videoId,
            preparedHashtags,
            preparedTags,
            preparedPlaylistIds,
            videoName,
            videoDescription,
            thumbnailUrl
        );

        return updatedVideo
    }


    async createVideo(
        videoId: string, 
        channelId: string, 
        videoName: string, 
        videoDescription: string, 
        videoPreview: string, 
        playlistIds: [], 
        fragments: [], 
        videoAccess: string, 
        hashTags: [], 
        tags: [], 
        isShort: boolean,
        files: Record<string, Express.Multer.File[]>
    ): Promise<VideoEntity> {
                
        await sendProgress(channelId, { progress: 8, stage: 'saving', message: '' });
            
        const videoUrl = `/videos/${videoId}/video/${files.videoFile[0].filename}`;
        const thumbnailUrl = `/videos/${videoId}/thumbnail/${files.videoPreview[0].filename}`;

        const publicDir = path.join(process.cwd(), "public");
        const videoIdDir = path.join(publicDir, "videos", videoId);
        const absoluteVideoPath = path.join(publicDir, videoUrl.replace(/^\//, ""));

        await sendProgress(channelId, { progress: 12, stage: 'saving', message: '' });
            
        let duration;
        try {
            duration = await getVideoDuration(absoluteVideoPath);
        } catch (err) {
            console.error("Failed to get video duration:", err);
            throw "Cannot read video duration"
        }

        const srtFilePath = await createSrtSubtitleFile(videoIdDir, absoluteVideoPath, files.videoFile[0].filename);
        console.log("srtFilePath ============ ", srtFilePath);

        await sendProgress(channelId, { progress: 36, stage: 'saving', message: '' });


        if (srtFilePath && fs.existsSync(srtFilePath)) {
            const stats = fs.statSync(srtFilePath);
            console.log(`SRT файл существует, размер: ${stats.size} байт`);
        } else {
            console.error("❌ SRT файл НЕ СУЩЕСТВУЕТ!");
        }

        const playlistDir = path.join(videoIdDir, "playlist");
            if (!fs.existsSync(playlistDir)) {
            fs.mkdirSync(playlistDir, { recursive: true });
        }

        const previewDir = path.join(videoIdDir, "preview");
            if (!fs.existsSync(previewDir)) {
            fs.mkdirSync(previewDir, { recursive: true });
        }

        const previewPath = path.join(previewDir, "preview.mp4");

        const hls480Dir = path.join(playlistDir, "480");
        const hls720Dir = path.join(playlistDir, "720");
        const hls1080Dir = path.join(playlistDir, "1080");

        if (!fs.existsSync(hls480Dir)) fs.mkdirSync(hls480Dir, { recursive: true });
        if (!fs.existsSync(hls720Dir)) fs.mkdirSync(hls720Dir, { recursive: true });
        if (!fs.existsSync(hls1080Dir)) fs.mkdirSync(hls1080Dir, { recursive: true });

        // 1. СОЗДАЕМ HLS ПОТОКИ
        // путь к экзешнику дома - D:\\ffmpeg\\ffmpeg-2026-01-29-git-c898ddb8fe-full_build\\bin\\ffmpeg.exe 
        // путь к экзешнику на работе - C:\\ffmpeg-2026-01-12-git-21a3e44fbe-full_build\\bin\\ffmpeg.exe

        const cmd = `D:\\ffmpeg\\ffmpeg-2026-01-29-git-c898ddb8fe-full_build\\bin\\ffmpeg.exe -i "${absoluteVideoPath}" \
        -map 0:v -map 0:a -c:a aac -b:a 128k -c:v libx264 -crf 23 -preset medium -vf "scale=-2:480" -hls_time 4 -hls_playlist_type vod -hls_segment_filename "${playlistDir}/480/output_480_%04d.ts" -f hls "${playlistDir}/480/output_480.m3u8" \
        -map 0:v -map 0:a -c:a aac -b:a 128k -c:v libx264 -crf 22 -preset medium -vf "scale=-2:720" -hls_time 4 -hls_playlist_type vod -hls_segment_filename "${playlistDir}/720/output_720_%04d.ts" -f hls "${playlistDir}/720/output_720.m3u8" \
        -map 0:v -map 0:a -c:a aac -b:a 192k -c:v libx264 -crf 20 -preset medium -vf "scale=-2:1080" -hls_time 4 -hls_playlist_type vod -hls_segment_filename "${playlistDir}/1080/output_1080_%04d.ts" -f hls "${playlistDir}/1080/output_1080.m3u8"`;

        await new Promise((resolve, reject) => {
            exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    console.error("Ошибка ffmpeg:", error);
                    console.error("stderr:", stderr);
                    reject(error);
                    return;
                }
                console.log("HLS плейлисты успешно созданы");
                resolve(true);
            });
        });

        // 2. СОЗДАЕМ master.m3u8 РУКАМИ
        const masterContent = `#EXTM3U
            #EXT-X-VERSION:3
            #EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=854x480
            480/output_480.m3u8
            #EXT-X-STREAM-INF:BANDWIDTH=1500000,RESOLUTION=1280x720
            720/output_720.m3u8
            #EXT-X-STREAM-INF:BANDWIDTH=3000000,RESOLUTION=1920x1080
            1080/output_1080.m3u8
        `;
        fs.writeFileSync(path.join(playlistDir, "master.m3u8"), masterContent);
        console.log("master.m3u8 создан");

        await sendProgress(channelId, { progress: 41, stage: 'saving', message: '' });


        // 3. СОЗДАЕМ СУБТИТРЫ
        const subtitles = await convertSrtToVTTAndCreateM3U8(srtFilePath, playlistDir);
        console.log("subtitles +++++++ ", subtitles);


        await sendProgress(channelId, { progress: 59, stage: 'saving', message: '' });

        // 4. СОЗДАЕМ PREVIEW (ОБЕРНУТЫЙ В PROMISE)
        await new Promise((resolve, reject) => {
            ffmpeg.ffprobe(absoluteVideoPath, (err, metadata) => {
                if (err) {
                    console.error("Ошибка ffprobe:", err);
                    reject(err);
                    return;
                }

                const totalDuration = metadata.format.duration;
                if (!totalDuration || totalDuration < 2) {
                    reject(new Error("Video too short for preview"));
                    return;
                }

                const cuts = [];
                const clipDuration = 2;

                for (let i = 0; i < 5; i++) {
                    const maxStart = totalDuration - clipDuration;
                    const start = Math.random() * maxStart;
                    cuts.push([start, start + clipDuration]);
                }

                const complexFilter = cuts
                .map(([start, end], i) => {
                    return `[0:v]trim=start=${start}:end=${end},setpts=PTS-STARTPTS[v${i}];[0:a]atrim=start=${start}:end=${end},asetpts=PTS-STARTPTS[a${i}];`;
                })
                .join("");

                const concatVideo = cuts.map((_, i) => `[v${i}]`).join("");
                const concatAudio = cuts.map((_, i) => `[a${i}]`).join("");

                ffmpeg(absoluteVideoPath)
                .complexFilter(
                    `${complexFilter}${concatVideo}concat=n=5:v=1:a=0[v];${concatAudio}concat=n=5:v=0:a=1[a]`,
                    ["v", "a"]
                )
                .videoCodec("libx264")
                .audioCodec("aac")
                .outputOptions(["-preset fast", "-crf 23", "-t 10"])
                .output(previewPath)
                .on("end", () => {
                    console.log("Preview mp4 создан:", previewPath);
                    resolve(true);
                })
                .on("error", (err) => {
                    console.error("Ошибка при создании preview:", err);
                    reject(err);
                })
                .run();
            });
        });

        await sendProgress(channelId, { progress: 89, stage: 'saving', message: '' });

        const thumbnail = "http://localhost:8080/" + thumbnailUrl;
        
        const fullPath = path.join(process.cwd(), 'public', thumbnailUrl);

        const averageColor = await getAverageColor(fullPath);

        console.log('averageColor: ', averageColor)

        const m3u8 = "http://localhost:8080/videos/" + videoId + "/playlist/master.m3u8";
        const preview = "http://localhost:8080/videos/" + videoId + "/preview/preview.mp4";
        const videoMp4 = "http://localhost:8080/videos/" + videoId + "/video/" + files.videoFile[0].filename;

        const createdVideo = await this.videoRepository.createVideo(
            videoId,
            videoMp4,
            videoName,
            videoDescription,
            m3u8,
            thumbnail,
            preview,
            fragments,
            channelId,
            duration,
            videoAccess,
            hashTags,
            tags,
            playlistIds,
            isShort,
            averageColor.hex
        );

        await sendProgress(channelId, { progress: 100, stage: 'saving', message: '' });

        const subscriptions = await this.subscriptionRepository.getAllSubscriptionsByFollowerId(channelId)

        const subsersIds = (Array.isArray(subscriptions) && subscriptions.length > 0) ? subscriptions?.map(s => s.channelId) : []
        
        const notifType = await this.notifRepository.getNotifType(NOTIF_TYPES.NEW_VIDEO)
        if (notifType) {
            await this.notifRepository.createNewVideoNotifs(createdVideo.id, subsersIds, notifType.id)
            // await broadcastNewVideo(activeNotifConnections, channelId, createdVideo)
        }

        return createdVideo
    }
}