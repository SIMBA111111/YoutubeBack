import { TVideoAccess } from "./video.consts";

export interface IVideoEntity {
  id: string;
  name: string;
  duration: number;
  thumbnailUrl: string;
  videoPreviewUrl: string;
  masterM3u8Url: string;
  videoMp4Url: string | null;
  description: string;
  channelId: string;
  viewsCount: number;
  likesCount: number;
  dislikesCount: number;
  commentsCount: number;
  videoAccess: TVideoAccess;
  averageColor: string;
  isShort: boolean;
  tags: string[];
  hashtags: string[];
  createdDate: string;
  datePublication: string;
  updatedDate: string;
}

export class VideoEntity implements IVideoEntity {
  id: string;
  name: string;
  duration: number;
  thumbnailUrl: string;
  videoPreviewUrl: string;
  masterM3u8Url: string;
  videoMp4Url: string | null;
  description: string;
  channelId: string;
  viewsCount: number;
  likesCount: number;
  dislikesCount: number;
  commentsCount: number;
  videoAccess: TVideoAccess;
  averageColor: string;
  isShort: boolean;
  tags: string[];
  hashtags: string[];
  createdDate: string;
  datePublication: string;
  updatedDate: string;

  constructor(data: IVideoEntity) {
    this.id = data.id;
    this.name = data.name;
    this.duration = data.duration;
    this.thumbnailUrl = data.thumbnailUrl;
    this.videoPreviewUrl = data.videoPreviewUrl;
    this.masterM3u8Url = data.masterM3u8Url;
    this.videoMp4Url = data.videoMp4Url;
    this.description = data.description;
    this.channelId = data.channelId;
    this.viewsCount = data.viewsCount;
    this.likesCount = data.likesCount;
    this.dislikesCount = data.dislikesCount;
    this.commentsCount = data.commentsCount;
    this.videoAccess = data.videoAccess;
    this.averageColor = data.averageColor;
    this.isShort = data.isShort;
    this.tags = data.tags;
    this.hashtags = data.hashtags;
    this.createdDate = data.createdDate;
    this.datePublication = data.datePublication;
    this.updatedDate = data.updatedDate;
  }
}