import { Request, Response } from "express";
import { pool } from "../utils/pg";
import { mapVideosToIVideo } from "../utils/maps/mapVideo";
import { mapPlaylistsToIPlaylists } from "../utils/maps/mapPlaylist";
import {
  getChannelById,
  getChannelHistory,
  getLikedVideos,
} from "../repositories/channel";
import { getLikedplaylists } from "../repositories/playlist";
import { getVideoListByTag, getViewedShortVideosByChannelId, getViewedVideosByChannelId } from "../repositories/video";

export const getMeInfo = async (req: Request, res: Response) => {
  console.log("getMeInfo");
  try {
    const { meId } = req.params;

    console.log("meId === ", meId);

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

    const response = await getLikedVideos(
      meId as string,
      offset as string,
      limit as string
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


    console.log('meId = ', meId);
    console.log('offset = ', offset);
    console.log('limit = ', limit);
    console.log('filter = ', filter);
    
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
    } else if (filter?.tags) {
      response = await getVideoListByTag(
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

    console.log('response = ', response);
    

    const result = {
      viewsHistory: mapVideosToIVideo(response),
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("Error getMyViewsHistory:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
