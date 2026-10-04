import { Request, Response } from "express";
import express from 'express'
import { SearchingRepository } from './searching.repository'
import { ApiResponseDTO } from "../../shared/dtos/response.dto";
import { getNumberParam, getStringParam } from "../../shared/utils/paramsParse";

export const router = express.Router();

const searchingRepository = new SearchingRepository()

router.get('/search-query/:query', async (req: Request, res: Response) => {
  console.log("search-query");
  try {
    const query = getStringParam(req.params.query)
    const offset = getNumberParam(req.query.offset)
    const limit = getNumberParam(req.query.limit)

    const response = await searchingRepository.getQueries(query, offset, limit)
    
    return res.status(200).json(ApiResponseDTO.success(response))
  } catch (error: any) {
    return res.status(500).json(ApiResponseDTO.error(error))
  }
});

router.post('/search-upsert-query', async (req: Request, res: Response) => {
  console.log("search-upsert-query");
  try {
    const query = getStringParam(req.body?.query)

    const response = await searchingRepository.upsertQuery(query)
    
    return res.status(200).json(ApiResponseDTO.success(response))
  } catch (error: any) {
    console.log('ERROR route search-upsert-query: ', error);
    return res.status(500).json(ApiResponseDTO.error(error))
  }
});

// router.patch('/search-update-query', async (req: Request, res: Response) => {
//   console.log("search-update-query");
//   try {
//     const query = getStringParam(req.body.query)

//     const response = await searchingRepository.upsertQuery(query)
    
//     return res.status(200).json(ApiResponseDTO.success(response))
//   } catch (error: any) {
//     return res.status(500).json(ApiResponseDTO.error(error))
//   }
// });