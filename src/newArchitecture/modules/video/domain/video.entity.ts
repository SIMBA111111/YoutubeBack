import { TVideoAccess } from "./video.consts";

export interface ITagEntity {
  id: string;
  name: string;
  createdDate: string;
  updatedDate: string;
}

export class TagEntity implements ITagEntity {
  id: string;
  name: string;
  createdDate: string;
  updatedDate: string;

  constructor(data: any) {
    this.id = data.id;
    this.name = data.name;
    this.createdDate = data.created_date;
    this.updatedDate = data.updated_date;
  }

  static fromDbRows(dbRows: any[]): TagEntity[] {
    return dbRows.map(row => new TagEntity(row));
  }
}



export interface IVideoEntity {
  id: string;
  name: string;
  videoHash: string;
  duration: number;
  thumbnailUrl: string;
  videoPreviewUrl: string;
  masterM3u8Url: string;
  videoMp4_Url: string;
  description: string;
  channelId: string;
  viewersCount: number;
  likesCount: number;
  dislikesCount: number;
  commentsCount: number;
  videoAccess: TVideoAccess;
  averageColor: string;
  isShort: boolean;
  tags: string[];
  hashtags: string[];
  playlistIds: string[];
  datePublication: string;
  updatedDate: string;
  createdDate: string;
}

export class VideoEntity implements IVideoEntity {
  id: string;
  name: string;
  videoHash: string;
  duration: number;
  thumbnailUrl: string;
  videoPreviewUrl: string;
  masterM3u8Url: string;
  videoMp4_Url: string;
  description: string;
  channelId: string;
  viewersCount: number;
  likesCount: number;
  dislikesCount: number;
  commentsCount: number;
  videoAccess: TVideoAccess;
  averageColor: string;
  isShort: boolean;
  tags: string[];
  hashtags: string[];
  playlistIds: string[];
  datePublication: string;
  updatedDate: string;
  createdDate: string;

  constructor(data: any) {
    this.id= data.id;
    this.name = data.name;
    this.videoHash = data.video_hash;
    this.duration = data.duration;
    this.thumbnailUrl = data.thumbnail_url;
    this.videoPreviewUrl = data.video_preview_url,
    this.masterM3u8Url = data.master_m3u8_url,
    this.videoMp4_Url = data.video_mp4_Url,
    this.description = data.description,
    this.channelId = data.channel_id;
    this.viewersCount = data.viewers_count;
    this.likesCount = data.likes_count;
    this.dislikesCount = data.dislikes_count;
    this.commentsCount = data.comments_count;
    this.videoAccess = data.video_access;
    this.averageColor = data.average_color;
    this.isShort = data.is_short;
    this.tags = data.tags
    this.hashtags = data.hashtags
    this.playlistIds = data.playlist_ids;
    this.datePublication = data.date_publication;
    this.updatedDate = data.updated_date;
    this.createdDate = data.created_date;
  }

  static fromDbRows(dbRows: any[]): VideoEntity[] {
    return dbRows.map(row => new VideoEntity(row));
  }
}