export interface ILink {
  id: string;
  name: string;
  url: string;
  linkAvatar: string;
}

export interface INotif {
  id: string;
  createdAt: string;
  isViewed: string;
  notifType: string;
  channel: {
    id: string
    name: string
    avatarUrl: string
  }
  video: {
    id: string
    previewUrl: string
    name: string;
    videoHash: string
    isShort:string
  }
}

const mapToINotif = (dbNotif: any): INotif => {
  return {
    id: dbNotif.id,
    createdAt: dbNotif.created_date,
    isViewed: dbNotif.viewed,
    notifType: dbNotif.notif_name,

    channel: {
      id: dbNotif.channel_id,
      name: dbNotif.channel_name,
      avatarUrl: dbNotif.avatar_url,
    },

    video: {
      id: dbNotif.video_id,
      previewUrl: dbNotif.thumbnail_url,
      name: dbNotif.video_name,
      videoHash: dbNotif.video_hash,
      isShort: dbNotif.is_short,
    },
  };
};

export const mapNotifToINotif = (dbNotifs: any[]): INotif[] => {
  return dbNotifs.map((notif) => mapToINotif(notif));
};
