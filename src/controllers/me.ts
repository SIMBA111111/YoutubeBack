import { Request, Response } from "express";
import { pool } from "../utils/pg";
import { mapVideosToIVideo } from "../utils/maps/mapVideo";
import { mapPlaylistsToIPlaylists } from "../utils/maps/mapPlaylist";
import {
  getChannelById,
  getChannelHistory,
  getLikedVideos,
  updateSaveHistoryByChannel,
} from "../repositories/channel";
import { getLikedplaylists } from "../repositories/playlist";
import { getVideoList, getVideoListByTag, getViewedShortVideosByChannelId, getViewedVideoListByTag, getViewedVideosByChannelId } from "../repositories/video";
import { deletHistoryByChannel } from "../repositories/stats";
import { getNotifsByUserId } from "../repositories/notifs";
import { mapNotifToINotif } from "../utils/maps/mapNotifs";

export const getMeInfo = async (req: Request, res: Response) => {
  console.log("getMeInfo");
  try {
    const { meId } = req.params;

    const response = await getChannelById(meId as string);

    const result = {
      meInfo: response,
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("Error getMeInfo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMyLikedVideoList = async (req: Request, res: Response) => {
  console.log("getMyLikedVideoList");
  try {
    const { meId } = req.params;
    const { offset, limit } = req.query;
    const filter = req.body?.filter || null;

    const isShort = filter?.isShort === true ? true : filter?.isShort === false ? false : null

    const response = await getLikedVideos(
      meId as string,
      isShort,
      offset ? Number(offset) : 0,
      limit ? Number(limit) : 20
    );

    const result = {
      likedVideos: mapVideosToIVideo(response),
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("Error getMyLikedVideoList:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const getMyLikedPlaylists = async (req: Request, res: Response) => {
  console.log("getMyLikedPlaylists");
  try {
    const { meId } = req.params;
    const { offset, limit } = req.query;

    const response = await getLikedplaylists(
      meId as string,
      offset as string,
      limit as string
    );

    const result = {
      likedPlaylists: mapPlaylistsToIPlaylists(response),
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("Error getMyLikedPlaylists:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const getMyViewsHistory = async (req: Request, res: Response) => {
  console.log("getMyViewsHistory");
  try {
    const { meId } = req.params;
    const { offset, limit } = req.query;
    const filter = req.body?.filter || null;
    
    let response

    if (filter?.isShort) {
      response = await getViewedShortVideosByChannelId(
        meId as string,
        true,
        parseInt(offset as string),
        parseInt(limit as string)
      );
    } else if(filter?.isShort === false) {
      response = await getViewedShortVideosByChannelId(
        meId as string,
        false,
        parseInt(offset as string),
        parseInt(limit as string)
      );
    } else if (filter?.tags === 'all') {
      response = await getViewedVideosByChannelId(
        meId as string,
        parseInt(offset as string),
        parseInt(limit as string)
      );
    } else if (filter?.tags) {      
      response = await getViewedVideoListByTag(
        filter.tags,
        parseInt(offset as string),
        parseInt(limit as string),
        meId as string,
      );
    } else {
      response = await getViewedVideosByChannelId(
        meId as string,
        parseInt(offset as string),
        parseInt(limit as string)
      );
    }

    const result = {
      viewsHistory: mapVideosToIVideo(response),
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("Error getMyViewsHistory:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const deleteMyViewsHistory = async (req: Request, res: Response) => {
  console.log("deleteMyViewsHistory");
  try {
    const { meId } = req.params;

    const response = await deletHistoryByChannel(
      meId as string,
    );

    const result = {
      success: response
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error deleteMyViewsHistory:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const updateSaveHistory = async (req: Request, res: Response) => {
  console.log("updateSaveHistory");
  try {
    const { meId } = req.params;
    const { isSaveHistory } = req.body;

    const response = await updateSaveHistoryByChannel(
      meId as string,
      isSaveHistory
    );

    const result = {
      updatedChannel: response,
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("Error updateSaveHistory:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const getMyNotifs = async (req: Request, res: Response) => {
  console.log("getMyNotifs");
  try {
    const { meId } = req.params;

    const response = await getNotifsByUserId(
      meId as string,
    );

    const result = {
      notifs: mapNotifToINotif(response),
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("Error getMyNotifs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};