/* eslint-disable no-undef */

import React, { useRef, useState} from 'react';
import axios from 'axios';
import {useHistory} from 'react-router';
import moment from 'moment';

const StompClientContext = React.createContext(null);

export default StompClientContext;

export function SpotifyContextProvider({ children }) {
    const clientId = "7db92e56e9244449b3eebc16f40ad031";
    const redirectUri = `${window.location.protocol}//${window.location.host}/auth`;
    const scope = "playlist-modify-public";
    const history = useHistory();

    const connection = useRef(null);
    const [accessToken, setAccessToken] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loginFailed, setLoginFailed] = useState(false);
    const [sessionExpired, setSessionExpired] = useState(false);
    const [creatingPlaylist, setCreatingPlaylist] = useState(false);
    const [createdPlaylist, setCreatedPlaylist] = useState(null);

    const startLogin = () => {
        umami('spotify-login-start');
        console.log('Starting spotify login...');
        window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=${scope}`
    }

    const finishLogin = async () => {
        console.log('Finishing spotify login...');
        setLoginFailed(false);
        // Grab the access token from the URL
        const urlParams = new URL(window.location.href.replace(/#/g,"?"));
        const newAccessToken = urlParams.searchParams.get("access_token");

        console.log(newAccessToken);
        if (!newAccessToken) {
            history.push('/');
            return;
        }
        setAccessToken(newAccessToken);

        const headers = {};
        headers.Authorization = `Bearer ${newAccessToken}`;
        connection.current = axios.create({
            timeout: 10000,
            crossDomain: true,
            headers
        });

        try {
            const userDataResponse = await connection.current.get('https://api.spotify.com/v1/me');
            setLoginFailed(false);
            setUserData(userDataResponse.data);
            history.push('/');
            umami('spotify-login-success');
        } catch (e) {
            setLoginFailed(true);
            history.push('/');
            umami('spotify-login-failure');
        }
    }

    const logout = async () => {
        console.log('Logging out from spotify...');
        connection.current = null;
        setUserData(null);
        setAccessToken(null);
        history.push('/');
        umami('spotify-logout');
    }

    const checkSession = async () => {
        try {
            await connection.current.get('https://api.spotify.com/v1/me');
        } catch (e) {
            expireSession();
        }
    }

    const expireSession = async () => {
        setSessionExpired(true);
        logout();
    }

    const search = async (searchTerm) => {
        try {
            umami('search');
            const searchResponse = await connection.current.get(`https://api.spotify.com/v1/search?q=${searchTerm}&type=artist`);
            return searchResponse.data;
        } catch (e) {
            checkSession();
            return null;
        }
    }

    const getArtist = async (artistId) => {
        umami('get-artist');
        try {
            const artistResponse = await connection.current.get(`https://api.spotify.com/v1/artists/${artistId}`);
            return artistResponse.data;
        } catch (e) {
            checkSession();
            return null;
        }
    }

    const getTracks = async (artistId, filter) => {
        umami('get-artist-tracks');
        const tracks = [];
        const convertDate = (date, precision) => {
            return moment(date);
        };
        try {
            let nextAlbumRequest = `https://api.spotify.com/v1/artists/${artistId}/albums?market=US&include_groups=${filter}&limit=50&offset=0`;
            while (nextAlbumRequest !== null) {
                const artistResponse = await connection.current.get(nextAlbumRequest);
                const {
                    items: albumItems,
                    next: nextAlbumUrl
                } = artistResponse.data;

                const albumNames = {};

                for (const album of albumItems) {
                    if (Object.hasOwnProperty.call(albumNames, album.name)) {
                        continue;
                    } else {
                        albumNames[album.name] = true;
                    }
                    let nextTrackRequest = `https://api.spotify.com/v1/albums/${album.id}/tracks?market=US&limit=50&offset=0`;
                    while (nextTrackRequest !== null) {
                        const tracksResponse = await connection.current.get(nextTrackRequest);
                        const {
                            items: trackItems,
                            next: nextTrackUrl
                        } = tracksResponse.data;

                        trackItems.forEach((item) => tracks.push({
                            ...item,
                            albumMetadata: {
                                release_date: album.release_date,
                                release_date_precision: album.release_date_precision,
                                href: album.external_urls.spotify,
                                momentDate: convertDate(album.release_date, album.release_date_precision),
                                name: album.name,
                                type: album.type
                            }
                        }));
                        nextTrackRequest = nextTrackUrl || null;
                    }
                }
                nextAlbumRequest = nextAlbumUrl || null;
            }

            return tracks;
        } catch (e) {
            checkSession();
            return null;
        }
    }

    const createSpotifyPlaylist = async (tracks, playlistName, description) => {
        setCreatingPlaylist(true);
        umami('create-playlist');

        let newPlaylist = null;
        try {
            const playlistResponse = await connection.current.post(`https://api.spotify.com/v1/users/${userData.id}/playlists`, {
                name: playlistName,
                description
            });
            newPlaylist = playlistResponse.data;

            // Add all tracks to the playlist in batches of 100
            let trackBatch = [];
            for (const track of tracks) {
                trackBatch.push(track.uri);
                if (trackBatch.length >= 100) {
                    await connection.current.post(`https://api.spotify.com/v1/playlists/${newPlaylist.id}/tracks`, {
                        uris: trackBatch
                    });
                    trackBatch = [];
                }
            }
            if (trackBatch.length > 0) {
                await connection.current.post(`https://api.spotify.com/v1/playlists/${newPlaylist.id}/tracks`, {
                    uris: trackBatch
                });
            }
        } catch (e) {
            checkSession();
            setCreatedPlaylist(null);
            setCreatingPlaylist(false);
            return null;
        }

        setCreatedPlaylist(newPlaylist);
        setCreatingPlaylist(false);
    };

    const loggedIn = userData !== null;

    return (
        <StompClientContext.Provider value={{
            startLogin,
            finishLogin,
            userData,
            loginFailed,
            setLoginFailed,
            loggedIn,
            logout,
            search,
            getArtist,
            sessionExpired,
            setSessionExpired,
            expireSession,
            checkSession,
            accessToken,
            getTracks,
            creatingPlaylist,
            createdPlaylist,
            setCreatedPlaylist,
            createSpotifyPlaylist
        }}>
            { children }
        </StompClientContext.Provider>
    );
}
