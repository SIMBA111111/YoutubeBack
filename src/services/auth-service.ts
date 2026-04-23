import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import {createTokenRepo} from '../repositories/auth-repository'
import { IChannel } from '../types/channel'

const SECRET_KEY = 'klsfjgdnkjlSDHBKjgfbskjdhfbksdbf'


export const cryptPassword = async (password: string) => {
  try {
    const saltRounds = 10; // число итераций соли
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    throw new Error (`Error cryptPassword: ${error}`)    
  }
}

export const checkPassword = async (password: string, cahnnel: IChannel) => {
  try {
    const isMatch = await bcrypt.compare(password, cahnnel.password)
    return isMatch
  } catch (error) {
    throw new Error(`Error checkPassword: ${error}`)
  }
}

export const createToken = async (channelId: string) => {
  try {
    const token = jwt.sign({ id: channelId }, SECRET_KEY, { expiresIn: '12h' })

    const res = await createTokenRepo(channelId, token)
    
    return res
  } catch (error) {
    throw new Error(`Error creating token: ${error}`);
  }
}

export const checkToken = async (token: string, channel: IChannel) => {
  try {
    const isMatch = await bcrypt.compare(token, channel.password)
    return isMatch
  } catch (error) {
    throw new Error(`Error checkPassword: ${error}`)
  }
}