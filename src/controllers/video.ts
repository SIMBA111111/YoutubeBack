import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from 'fs'
import { Request, Response } from 'express';

import { exec } from "child_process";
import { pool } from '../utils/pg';
import {getVideoDuration} from '../utils/getVideoDuration'
import {createSrtSubtitleFile} from '../services/video/createSrtFile'
import {convertSrtToVTTAndCreateM3U8} from '../services/video/convertSrtToVTT'
import {createMasterM3U8File} from '../services/video/createMasterM3U8File'
import { getTagById } from "../repositories/video";


export const getTags = async (req: Request, res: Response) => {
    console.log('getTags');
    try {
        const response = await pool.query('SELECT * FROM tags');
        const result = {
            tags: response.rows,
            total: response.rows.length,
        };
        
        res.json(result);
    } catch (error) {
        console.error('Error getVideos:', error);
        res.status(500).json({ error: 'Internal server error1' });
    }
};

// надо будеть еще добавить обработку запросов к бд на случай, если юзер не атворизован (нет channel_id) 
export const getVideos = async (req: Request, res: Response) => {
    console.log('getVideos');
    try {
        const tagId = req.query.tagId
        const channelData = JSON.parse(req.cookies.channelData || '')
        const channelId = channelData.id

        // Преобразуем query параметры в числа
        // const page = parseInt(req.query.page as string) || 1;
        // const limit = parseInt(req.query.limit as string) || 20;
        
        // const startIndex = (page - 1) * limit;
        // const endIndex = page * limit;

        const tag = await getTagById(tagId as string)
        
        let response

        if(tag.name === 'fresh') {
            response = await pool.query('SELECT * FROM videos ORDER BY date_publication DESC');
        } else if ( tag.name === 'newForMe') {
            response = await pool.query(`
                SELECT v.* 
                FROM videos v
                JOIN subscriptions s ON v.channel_id = s.channel_id
                WHERE s.follower_channel_id = $1
                ORDER BY v.date_publication DESC 
            `, [channelId]);
        } else if (tag.name === 'viewed') {
            response = await pool.query(`
                SELECT v.* 
                FROM videos v
                JOIN stat_of_videos sov ON v.id = sov.video_id
                WHERE sov.views_count > 0 AND sov.channel_id = $1
            `, [channelId]);
        } else if(tag.name === 'all') {
            response = await pool.query('SELECT * FROM videos');
        } else {
            response = await pool.query('SELECT * FROM videos WHERE $1 = ANY (tags)', [tag.id]);
        }

        const videos = response.rows;
        
        // const result = {
        //     videos: videos.slice(startIndex, endIndex),
        //     total: videos.length,  // используем длину из БД, а не из videosData
        //     page: page,
        //     totalPages: Math.ceil(videos.length / limit)
        // };

        const result = {
            videos: videos,
            total: videos.length,
        };
        
        res.json(result);
    } catch (error) {
        console.error('Error getVideos:', error);
        res.status(500).json({ error: 'Internal server error1' });
    }
};

export const getRecommendedVideos = async (req: Request, res: Response) => {
    console.log('getRecommendedVideos');
    try {
        const videoHash = req.params.videoHash
        const { offset, limit } = req.query
        const { myChannelId } = req.body

        const response = await pool.query('select * from videos OFFSET $1 LIMIT $2', [offset, limit])        

        const result = {
            videos: response.rows || [],
            total: response.rows?.length || 0,
        };

        res.status(200).json(result);
    } catch (error) {
        console.error('Error getRecommendedVideos:', error);
        res.status(500).json({ error: 'Internal server error1' });
    }
};

export const getVideoById = async (req: Request, res: Response) => {
    console.log('getVideoById');
    try {
        const videoId = req.params.id;
        const response = await pool.query('select * from videos where id=$1', [videoId])        
        const video = response.rows[0]

        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }
        
        res.json(video);
    } catch (error) {
        console.error('Error getVideoById:', error);
        res.status(500).json({ error: 'Internal server error2' });
    }
};

export const getVideoByHash = async (req: Request, res: Response) => {
    console.log('getVideoByHash');
    try {
        const { channelId } = req.body;
        const { hash: videoHash } = req.params;

        const videoRes = await pool.query(`
            SELECT * FROM videos WHERE video_hash = $1
        `, [videoHash])        
        const video = videoRes.rows[0]

        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        const channelRes = await pool.query(`
            SELECT ch.* 
            FROM videos v 
            JOIN channels ch ON v.channel_id = ch.id
            WHERE video_hash = $1
        `, [videoHash])        
        const channel = channelRes.rows[0]

        const isSubRes = await pool.query(`SELECT * FROM subscriptions WHERE follower_channel_id = $1 AND channel_id = $2`, [channelId, channel.id])
        const isSubscribed = isSubRes.rows[0]    

        const statRes = await pool.query(`SELECT * FROM stat_of_videos WHERE video_id = $1 AND channel_id = $2`, [video.id, channelId])
        const stat = statRes.rows[0] 
        
        res.status(200).json({video: video, channel: channel, isSubscribed: isSubscribed, stat: stat});
    } catch (error) {
        console.error('Error getVideoByHash:', error);
        res.status(500).json({ error: 'Internal server error2' });
    }
};

export const getVideoListByName = async (req: Request, res: Response) => {
    console.log('getVideoListByName');
    try {
        const videoName = req.params.name;
        const response = await pool.query(
            'select id, name from videos where name ilike $1',
            [`%${videoName}%`]
        );      
        const video = response.rows

        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }
        
        res.json(video);
    } catch (error) {
        console.error('Error getVideoListByName:', error);
        res.status(500).json({ error: 'Internal server error3' });
    }
};


export const markVideo = async (req: Request, res: Response) => {
    console.log('markVideo');
    try {
        const { videoId } = req.params;
        const { userId, isLiked, isDisliked } = req.body;

        // Проверяем, существует ли запись статистики
        const videoStatRes = await pool.query(
            `SELECT * FROM stat_of_videos WHERE channel_id = $1 AND video_id = $2`,
            [userId, videoId]
        );
        const oldStat = videoStatRes.rows[0];

        let oldLiked = false;
        let oldDisliked = false;

        if (oldStat) {
            oldLiked = oldStat.liked;
            oldDisliked = oldStat.disliked;
            
            // Обновляем существующую запись
            await pool.query(
                `UPDATE stat_of_videos 
                 SET liked = $1, disliked = $2 
                 WHERE channel_id = $3 AND video_id = $4`,
                [isLiked, isDisliked, userId, videoId]
            );
        } else {
            // Создаем новую запись
            await pool.query(
                `INSERT INTO stat_of_videos (channel_id, video_id, liked, disliked) 
                 VALUES ($1, $2, $3, $4)`,
                [userId, videoId, isLiked, isDisliked]
            );
        }

        // Обновляем счетчики видео
        // Сначала обрабатываем лайки
        if (oldLiked !== isLiked) {
            if (isLiked) {
                await pool.query(`UPDATE videos SET likes_count = likes_count + 1 WHERE id = $1`, [videoId]);
            } else {
                await pool.query(`UPDATE videos SET likes_count = likes_count - 1 WHERE id = $1`, [videoId]);
            }
        }

        // Обрабатываем дизлайки
        if (oldDisliked !== isDisliked) {
            if (isDisliked) {
                await pool.query(`UPDATE videos SET dislikes_count = dislikes_count + 1 WHERE id = $1`, [videoId]);
            } else {
                await pool.query(`UPDATE videos SET dislikes_count = dislikes_count - 1 WHERE id = $1`, [videoId]);
            }
        }

        // Получаем обновленную статистику для ответа
        const updatedStatsRes = await pool.query(
            `SELECT liked, disliked FROM stat_of_videos 
             WHERE channel_id = $1 AND video_id = $2`,
            [userId, videoId]
        );
        const updatedStats = updatedStatsRes.rows[0];

        res.status(200).json({ 
            success: true, 
            stats: updatedStats 
        });
        
    } catch (error) {
        console.error('Error markVideo:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


export const viewVideo = async (req: Request, res: Response) => {
    console.log('viewVideo');
    try {
        const videoId = req.params.videoId;
        const { userId } = req.query;
        
        const response = await pool.query('select * from videos where id=$1', [videoId])        
        const video = response.rows[0]

        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }
    
        await pool.query('UPDATE videos SET viewers_count = viewers_count + 1 WHERE id = $1', [videoId]);      

        if(userId) {
            const statRes = await pool.query('SELECT * FROM stat_of_videos WHERE channel_id = $1 AND video_id = $2', [userId, videoId]);      
            
            if(statRes.rows[0]) {
                await pool.query('UPDATE stat_of_videos SET views_count = views_count + 1, updated_date = now() WHERE channel_id = $1 AND video_id = $2', [userId, videoId]);      
            } else {
                await pool.query('INSERT INTO stat_of_videos (channel_id, video_id, views_count) VALUES ($1, $2, 1)', [userId, videoId]);      
            }
            
        }
        
        res.status(203).json('Updated succesfully')
    } catch (error) {
        console.error('Error viewVideo:', error);
        res.status(500).json({ error: 'Internal server error2' });
    }
};

// controllers/video-controller.js
// export const createVideo = async (req: Request, res: Response) => {
//   const videoId = req.videoId;

//   const title = req.body.title;
//   const views = Number(req.body.views);
//   const channel_id = req.body.channel_id;
//   // const channel_name = req.body.channel_name;
//   // const channel_avatarUrl = req.body.channel_avatarUrl;
//   const fragments = JSON.parse(req.body.fragments || "[]");


//   const videoUrl = `/videos/${videoId}/video/${req.files.video[0].filename}`;
//   const thumbnailUrl = `/videos/${videoId}/thumbnail/${req.files.thumbnail[0].filename}`;


//   const publicDir = path.join(process.cwd(), "public");
//   const videoIdDir = path.join(publicDir, "videos", videoId); // /public/videos/:videoId

//   const absoluteVideoPath = path.join(publicDir, videoUrl.replace(/^\//, ""));
//   const videoDir = path.dirname(absoluteVideoPath); // /public/videos/:videoId/video

//   let duration;
//   try {
//     duration = await getVideoDuration(absoluteVideoPath);
//   } catch (err) {
//     console.error("Failed to get video duration:", err);
//     return res.status(500).json({ error: "Cannot read video duration" });
//   }

//   const srtFilePath = await createSrtSubtitleFile(videoIdDir, absoluteVideoPath, req.files.video[0].filename) // создаем srt файл
//   console.log('srtFilePath ============ ', srtFilePath);


//   const playlistDir = path.join(videoIdDir, "playlist");
//   if (!fs.existsSync(playlistDir)) {
//     fs.mkdirSync(playlistDir, { recursive: true });
//   }

//   const hlsPlaylistPath = path.join(playlistDir, "video.m3u8");
//   const playlistMasterPath = path.join(playlistDir, "master.m3u8");
//   const hlsSegmentPath = path.join(playlistDir, "video_fragment_%03d.ts");

//   // preview на уровне video, thumbnail, playlist
//   const previewDir = path.join(videoIdDir, "preview");
//   if (!fs.existsSync(previewDir)) {
//     fs.mkdirSync(previewDir, { recursive: true });
//   }

//   const previewPath = path.join(previewDir, "preview.mp4");
//   const previewUrl = `/videos/${videoId}/preview/preview.mp4`;


//     const hls480Dir = path.join(playlistDir, "480");
//   const hls720Dir = path.join(playlistDir, "720");
//   const hls1080Dir = path.join(playlistDir, "1080");

//   if (!fs.existsSync(hls480Dir)) fs.mkdirSync(hls480Dir, { recursive: true });
//   if (!fs.existsSync(hls720Dir)) fs.mkdirSync(hls720Dir, { recursive: true });
//   if (!fs.existsSync(hls1080Dir)) fs.mkdirSync(hls1080Dir, { recursive: true });





// const cmd = `D:\\ffmpeg\\ffmpeg-2026-01-29-git-c898ddb8fe-full_build\\bin\\ffmpeg.exe -i "${absoluteVideoPath}" \
//   -map 0:v -map 0:a -c:a aac -b:a 128k -c:v libx264 -crf 23 -preset medium -vf "scale=-2:480" -hls_time 4 -hls_playlist_type vod -hls_segment_filename "${playlistDir}/480/output_480_%04d.ts" -f hls "${playlistDir}/480/output_480.m3u8" \
//   -map 0:v -map 0:a -c:a aac -b:a 128k -c:v libx264 -crf 22 -preset medium -vf "scale=-2:720" -hls_time 4 -hls_playlist_type vod -hls_segment_filename "${playlistDir}/720/output_720_%04d.ts" -f hls "${playlistDir}/720/output_720.m3u8" \
//   -map 0:v -map 0:a -c:a aac -b:a 192k -c:v libx264 -crf 20 -preset medium -vf "scale=-2:1080" -hls_time 4 -hls_playlist_type vod -hls_segment_filename "${playlistDir}/1080/output_1080_%04d.ts" -f hls "${playlistDir}/1080/output_1080.m3u8" \
//   -master_pl_name "${playlistDir}/master.m3u8"`;

// exec(cmd, (error, stdout, stderr) => {
//   if (error) {
//     console.error("Ошибка ffmpeg:", error);
//     console.error("stderr:", stderr);
//     return;
//   }
//   console.log("stdout:", stdout);
//   console.log("HLS 480/720/1080 и master.m3u8 успешно созданы в:", playlistDir);
// });



//     const subtitles = await convertSrtToVTTAndCreateM3U8(srtFilePath, playlistDir) // создаем vtt файл и m3u8 файл субтитров
//     console.log('subtitles +++++++ ', subtitles);
    

//   // 2. Создаём короткий 10‑секундный mp4‑превью из 5 рандомных кусков по 2 секунды
//    console.log(previewUrl);
   

//   // Получаем длительность исходного видео (в секундах)
//   ffmpeg.ffprobe(absoluteVideoPath, (err, metadata) => {
//     if (err) {
//       console.error("Ошибка ffprobe:", err);
//       return;
//     }

//     const totalDuration = metadata.format.duration; // в секундах
//     if (!totalDuration || totalDuration < 2) {
//       console.warn("Видео слишком короткое для превью");
//       return;
//     }

//     const cuts = [];
//     const clipDuration = 2; // по 2 секунды

//     // 5 рандомных кусков по 2 секунды
//     for (let i = 0; i < 5; i++) {
//       const maxStart = totalDuration - clipDuration;
//       const start = Math.random() * maxStart;
//       cuts.push(`[${start},${start + clipDuration}]`);
//     }

//     // Собираем команду с trim + concat
//     const complexFilter = cuts
//       .map((cut, i) => {
//         const [start, end] = cut.match(/\[(\d+\.?\d*),(\d+\.?\d*)\]/).slice(1, 3);
//         return `[0:v]trim=start=${start}:end=${end},setpts=PTS-STARTPTS[v${i}];[0:a]atrim=start=${start}:end=${end},asetpts=PTS-STARTPTS[a${i}];`;
//       })
//       .join("");

//     const concatVideo = cuts.map((_, i) => `[v${i}]`).join("");
//     const concatAudio = cuts.map((_, i) => `[a${i}]`).join("");

//     ffmpeg(absoluteVideoPath)
//       .complexFilter(
//         `${complexFilter}${concatVideo}concat=n=5:v=1:a=0[v];${concatAudio}concat=n=5:v=0:a=1[a]`,
//         ["v", "a"]
//       )
//       .videoCodec("libx264")
//       .audioCodec("aac")
//       .outputOptions([
//         "-preset fast",
//         "-crf 23",
//         "-t 10", // обрезаем до 10 секунд (на случай, если чуть больше)
//       ])
//       .output(previewPath)
//       .on("end", () => {
//         console.log("Preview mp4 создан:", previewPath);
//       })
//       .on("error", (err) => {
//         console.error("Ошибка при создании preview:", err);
//       })
//       .run();
//   });


//   await createMasterM3U8File(playlistDir)
//   console.log('duration =- ', duration);
  
//   try {
//     // 1. Добавляем видео и получаем его id
//     const videoRes = await pool.query(
//       `
//       INSERT INTO videos (
//         title,
//         duration,
//         views,
//         channel_id,
//         thumbnailurl,
//         videourl,
//         playlisturl,
//         video_preview_url
//       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
//       RETURNING id
//       `,
//       [
//         title,
//         duration,
//         views,
//         channel_id,
//         thumbnailUrl,
//         videoUrl,
//         // hlsPlaylistPath.replace(/^.*?\\videos\\/, "/videos/"),
//         playlistMasterPath.replace(/^.*?\\videos\\/, "/videos/"),
//         previewPath.replace(/^.*?\\videos\\/, "/videos/")
//       ]
//     );

//     const insertedVideoId = videoRes.rows[0].id;
//     console.log('insertedVideoId = ', insertedVideoId);
    

//   if (fragments.length > 0) {
//     const fragmentValues = fragments
//       .map((f, i) => `(
//         $${i * 4 + 10}::uuid,
//         $${i * 4 + 11}::integer,
//         $${i * 4 + 12}::integer,
//         $${i * 4 + 13}::text
//       )`)
//       .join(", ");

//     const fragmentParams = fragments.flatMap((f) => [
//       insertedVideoId,
//       f.start,
//       f.end,
//       f.title,
//     ]);


//     console.log('fragmentParams ==============', fragmentParams);
    

//     try {
// await pool.query(
//   `
//   INSERT INTO fragments (video_id, start, "end", title)
//   VALUES ($1, $2, $3, $4)
//   `,
//   ["48f14119-922e-4319-981b-ded742678410", 0, 2, 'sdf']
// );
//     } catch (err) {
//       console.error('Ошибка при добавлении фрагментов:', err);
//     }
//   }

//     // 3. Возвращаем объект IVideo
//     res.status(201).json({
//       id: insertedVideoId,
//       title,
//       duration,
//       views,
//       channel: {
//         id: channel_id,
//         // name: channel_name,
//         // avatarUrl: channel_avatarUrl,
//       },
//       fragments,
//       thumbnail: thumbnailUrl,
//       videoPreview: videoUrl,
//     });
//   } catch (err) {
//     console.error("Ошибка при добавлении видео/фрагментов:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// export const searchVideos = (req, res) => {
//     try {
//         const query = req.params.query.toLowerCase();
//         const results = videosData.filter(video => 
//             video.title.toLowerCase().includes(query) ||
//             video.channel.name.toLowerCase().includes(query)
//         );
        
//         res.json({
//             query,
//             results,
//             count: results.length
//         });
//     } catch (error) {
//         console.error('Error searching videos:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };

// export const getPopularVideos = (req, res) => {
//     try {
//         const popularVideos = [...videosData]
//             .sort((a, b) => b.views - a.views)
//             .slice(0, 20);
        
//         res.json({
//             title: 'Popular Videos',
//             videos: popularVideos
//         });
//     } catch (error) {
//         console.error('Error fetching popular videos:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };