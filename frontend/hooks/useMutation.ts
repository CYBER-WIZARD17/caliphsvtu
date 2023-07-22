import { useReducer, useCallback, useEffect } from "react";
import useAuth from "./useAuth";
import useUI from './useUI';

import RequestError from '../utils/RequestError';
type State<T extends object> = {
    error: RequestError | null,
    data: T | null
}

type actions<T extends object> = {type: 'INIT'} | {type: 'SET_DATA', data: T} | {type: 'SET_ERROR', error: RequestError}

const initialState = {
    error: null,
    data: null
}




export type Fetcher<Response extends object = {}, Body extends object = {}> = (body: Body, token?: string | null, ...args: any[]) => Promise<Response>

interface Reducer<Response extends object> {
    (state: State<Response>, action: actions<Response>): State<Response>
}

function reducer<ResponseData extends object = {}>(state: State<ResponseData> = initialState, action: actions<ResponseData>): State<ResponseData> {
    if(action.type === 'INIT') {
        return {
            ...state,
            error: null
        }
    }

    if(action.type == 'SET_DATA') {
        return {
            data: action.data,
            error: null
        }
    }

    if(action.type === 'SET_ERROR') {
        return {
            data: null,
            error: action.error
        }
    }

    return state;
}



function useMutation<Response extends object = {}, Body extends object = {}>(fetcher: Fetcher<Response, Body>, requireAuth: boolean = false){
    const [state, dispatch] = useReducer<Reducer<Response>>(reducer, initialState);
    const {token, logoutHandler} = useAuth();
    const {openToastHandler} = useUI();

    const {error} = state;

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if(error instanceof RequestError && error.code === 401 && token) {
            openToastHandler('warning', "Session timed out, Redirecting...", 2000);
            timer = setTimeout(() => {
                logoutHandler();
            }, 3000);
        }

        return () => {
            if(timer) {
                clearTimeout(timer);
            }
        }
    }, [error, token, logoutHandler, openToastHandler]);

    const sendRequest = useCallback(async (data: Body, ...args: any[]) => {
        dispatch({type: 'INIT'})
        try {
            const response = await fetcher(data, requireAuth ? token : undefined, ...args);
            dispatch({type: 'SET_DATA', data: response});
        } catch (error: any) {
            const modifiedError = new RequestError({message: error.message || 'Sending Request failed', code: error.code || 500});
            dispatch({type: 'SET_ERROR', error: modifiedError});
        }
    }, [fetcher, token, requireAuth]);


    return {
        ...state,
        sendRequest
    };

}

export default useMutation;