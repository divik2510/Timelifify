import {
    Heading
} from '@chakra-ui/react';
import './AuthScreen.scss';
import {Spinner} from '@chakra-ui/spinner';
import {useContext, useEffect} from 'react';
import SpotifyContext from '../../../context/SpotifyContext';

function AuthScreen() {
    const {
        finishLogin
    } = useContext(SpotifyContext);

    useEffect(() => {
        finishLogin();
    }, [finishLogin]);

    return (
        <div className="AuthScreen">
            <Spinner size="xl"
                     thickness="4px"
                     color="gray.500"/>
            <Heading size={"sm"} mt={4}>Connecting to Spotify....</Heading>
        </div>
    );
}

export default AuthScreen;
