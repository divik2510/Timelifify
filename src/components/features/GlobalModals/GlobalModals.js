import {useContext} from 'react';
import SpotifyContext from '../../../context/SpotifyContext';
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    Button,
    Text,
    Heading
} from "@chakra-ui/react"
import {Spinner} from '@chakra-ui/spinner';
import {LinkIcon} from '@chakra-ui/icons';
import {Alert, AlertIcon} from '@chakra-ui/alert';
import {LinkOverlay} from '@chakra-ui/layout';

function GlobalModals() {
    const {
        loginFailed,
        setLoginFailed,
        sessionExpired,
        setSessionExpired,
        creatingPlaylist,
        createdPlaylist,
        setCreatedPlaylist
    } = useContext(SpotifyContext);

    return (
        <>
            <AlertDialog
                isOpen={loginFailed}
                onClose={() => setLoginFailed(false)}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Login to Spotify Failed
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Timelineify could not login to Spotify. Please try again.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button onClick={() => setLoginFailed(false)}>
                                Continue
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
            <AlertDialog
                isOpen={sessionExpired}
                onClose={() => setSessionExpired(false)}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Session expired
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Your Spotify session has expired. Please log in again to continue.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button onClick={() => setSessionExpired(false)}>
                                Continue
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
            <AlertDialog
                isOpen={creatingPlaylist}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Creating playlist....
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            <Spinner mb={4}/>
                        </AlertDialogBody>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
            <AlertDialog
                isOpen={createdPlaylist !== null}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Created Playlist
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            {createdPlaylist !== null && (
                                <>
                                    <Text color={'gray.500'}>A playlist was saved to your account:</Text>
                                    <a href={createdPlaylist.external_urls.spotify} target="_blank" rel="noreferrer"><Heading colorScheme='green' size={'md'} mt={2}><LinkIcon mr={2} />{createdPlaylist.name}</Heading></a>

                                        <Alert mt={5}  status="success" variant="top-accent" borderRadius={5} cursor="pointer">
                                            <LinkOverlay href="https://www.buymeacoffee.com/chrisdalke" target="_blank">
                                            <AlertIcon />
                                            <div>
                                                Timelineify is free because of your support!<br />
                                                <u>Like it? Buy me a coffee!</u>
                                            </div>
                                            </LinkOverlay>
                                        </Alert>
                                </>
                            )}
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button onClick={() => setCreatedPlaylist(null)}>
                                Done
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    );
}

export default GlobalModals;
