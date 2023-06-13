import {
    Heading,
    HStack,
    Avatar, Box,
    VStack,
    Button,
    Spacer,
    Skeleton,
    Text,
    Table,
    Thead,
    Tbody,
    Tfoot,
    Tr,
    Th,
    Td,
    TableCaption,
    Checkbox, Stack,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuItemOption,
    MenuGroup,
    MenuOptionGroup,
    MenuIcon,
    MenuCommand,
    MenuDivider,
    Divider, Spinner
} from '@chakra-ui/react';
import {useContext, useEffect, useState} from 'react';
import SpotifyContext from '../../../context/SpotifyContext';
import {useHistory, useParams} from 'react-router';
import {ChevronDownIcon, ChevronLeftIcon} from '@chakra-ui/icons';
import {Container} from '@chakra-ui/layout';

function TrackRow({ track, index }) {
    const {
        name,
        type,
        albumMetadata
    } = track;

    const {
        name: albumName,
        release_date,
        release_date_precision,
        momentDate,
        href: albumHref
    } = albumMetadata;

    let dateStr = release_date;
    if (release_date_precision === 'day') {
        dateStr = momentDate.format('MMM Mo, YYYY');
    } else if (release_date_precision === 'month') {
        dateStr = momentDate.format('Mo YYYY');
    }

    return (
        <Tr>
            <Td pl={0}><a href={track.external_urls.spotify} target="_blank" rel="noreferrer">{name}</a></Td>
            <Td color={'gray.500'}><a href={albumHref} target="_blank" rel="noreferrer">{albumName}</a></Td>
            <Td pr={0}>{dateStr}</Td>
        </Tr>
    );
}
function ArtistScreen() {
    const { id } = useParams();

    const {
        getArtist,
        checkSession,
        getTracks,
        createSpotifyPlaylist,
        creatingSpotifyPlaylist
    } = useContext(SpotifyContext);
    const history = useHistory();


    const [artist, setArtist] = useState(null);
    const [tracks, setTracks] = useState(null);
    const [sortedTracks, setSortedTracks] = useState(null);
    const [showAlbums, setShowAlbums] = useState(true);
    const [showSingles, setShowSingles] = useState(true);
    const [showAppearsOn, setShowAppearsOn] = useState(false);
    const [showCompilation, setShowCompilation] = useState(false);
    const [sortOrder, setSortOrder] = useState('Oldest First');

    const loadArtistInfo = async (_id) => {
        const artistData = await getArtist(_id);

        if (!artistData) {
            checkSession();
            history.push('/');
            return;
        }

        setArtist(artistData);
    };

    const loadTrackInfo = async (_id, filter) => {
        // Load the artist tracks
        // Clear the tracks while loading new list.
        setTracks(null);
        const tracks = await getTracks(_id, filter);
        setTracks(tracks);
    }

    const sortTracks = async () => {
        if (!tracks) {
            setSortedTracks(null);
            return;
        }
        const newSortedTracks = tracks.slice(0);
        newSortedTracks.sort((a, b) => {
            const date1 = a.albumMetadata.momentDate;
            const date2 = b.albumMetadata.momentDate;
            if (sortOrder === 'Oldest First') {
                return date1.diff(date2);
            } else {
                return date2.diff(date1);
            }
        });
        setSortedTracks(newSortedTracks);
    }

    useEffect(() => {
        sortTracks();
    }, [tracks, sortOrder]);

    useEffect(() => {
        let filterArr = [];
        let filter = '';
        if (showAlbums) {
            filterArr.push('album')
        }
        if (showSingles) {
            filterArr.push('single')
        }
        if (showAppearsOn) {
            filterArr.push('appears_on')
        }
        if (showCompilation) {
            filterArr.push('compilation')
        }
        filter = filterArr.join(',');
        loadTrackInfo(id, filter);
    }, [id, showAlbums, showSingles, showAppearsOn, showCompilation]);


    useEffect(() => {
        loadArtistInfo(id);
    }, [id]);

    const hasTracks = sortedTracks !== null && sortedTracks.length > 0;

    if (!artist) {
        return (
            <VStack align={'stretch'}>
                <Box align={'right'} color={'gray.500'}>
                    <Button size='sm' onClick={() => history.push('/')} variant={'minimal'}><ChevronLeftIcon mr={2}/> Back to Search</Button>
                </Box>
                <Box borderRadius={'5px'} bg={'gray.700'} boxShadow={'dark-lg'} overflow='hidden' mb={2} p={2}>
                    <HStack p={2} align={'top'}>
                        <Skeleton>
                            <Avatar borderRadius={5} size={'2xl'} mr={4}/>
                        </Skeleton>
                        <Skeleton h={8}>
                            <Heading color={'gray.300'}>Artist Name</Heading>
                            {sortedTracks !== null && (
                                <Text>{sortedTracks.length} tracks</Text>
                            )}
                        </Skeleton>
                        <Spacer />
                    </HStack>
                </Box>
            </VStack>
        )
    }

    const {
        name,
        images
    } = artist;

    return (
        <VStack align={'stretch'}>
            <Box align={'right'} color={'gray.500'}>
                <Button size='sm' onClick={() => history.push('/')} variant={'minimal'}><ChevronLeftIcon mr={2}/> Back to Search</Button>
            </Box>
            <Box borderRadius={'5px'} bg={'gray.700'} boxShadow={'dark-lg'} overflow='hidden' mb={2} p={2}>
                <Stack direction={["column", "column", "row"]} justify="stretch" align="stretch" p={2}>
                    <HStack align={'top'}>
                        <Avatar src={images.length > 0 ? images[0].url : null} name={name} borderRadius={5} size={'xl'} mr={4} bg={'gray.500'}/>
                        <VStack justify={'center'} align={'start'}>
                            <a href={artist.external_urls.spotify} target="_blank" rel="noreferrer"><Heading color={'gray.300'}>{name}</Heading></a>
                            <Text color={'gray.500'}>{tracks !== null ? `${tracks.length} tracks` : (
                                <>
                                    <Spinner size={'sm'} mr={2} color={'gray.500'}/>
                                    Loading tracks. This might take a little while...
                                </>
                            )
                            }</Text>
                        </VStack>
                        <Spacer />
                    </HStack>
                    <Spacer />
                    <Button colorScheme={'green'} onClick={() => {
                        createSpotifyPlaylist(
                            sortedTracks,
                            `Artist Timeline: ${artist.name} // Timelineify`,
                            `Sort Order: ${sortOrder} | Chronological playlist generated with www.timelineify.com 🎧`
                        );
                    }}
                            disabled={creatingSpotifyPlaylist || !hasTracks}
                    >Save Timeline as Playlist</Button>
                </Stack>
            </Box>
            <Box borderRadius={'5px'} bg={'gray.700'} boxShadow={'dark-lg'} overflow='hidden' mb={2} p={5}>
                <Stack direction={["column", "column", "row"]} justify="stretch" align="center">
                    <Heading size={'sm'} color={'gray.300'} mr={3}>Artist Timeline</Heading>
                    <Spacer />
                    <HStack>
                        <Checkbox size={'sm'} isChecked={showAlbums} onChange={() => setShowAlbums(!showAlbums)}>Albums</Checkbox>
                        <Checkbox size={'sm'} isChecked={showSingles} onChange={() => setShowSingles(!showSingles)}>Singles</Checkbox>
                        <Checkbox size={'sm'} isChecked={showCompilation} onChange={() => setShowCompilation(!showCompilation)}>Compilation</Checkbox>
                        <Menu>
                            <MenuButton size={'sm'} variant={'minimal'} as={Button} rightIcon={<ChevronDownIcon />}>
                                {sortOrder}
                            </MenuButton>
                            <Spacer />
                            <MenuList>
                                <MenuItem onClick={() => setSortOrder('Oldest First')}>Oldest First</MenuItem>
                                <MenuItem onClick={() => setSortOrder('Newest First')}>Newest First</MenuItem>
                            </MenuList>
                        </Menu>
                    </HStack>
                </Stack>
                <Divider mt={4} mb={4}/>
                <Spacer />
                <Table size="sm" mt={4}>
                    <Thead>
                        <Tr>
                            <Th pl={0}>Track Name</Th>
                            <Th>Album</Th>
                            <Th minW={'150px'} pr={0}>Release Date</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {sortedTracks !== null ? sortedTracks.map((track, i) => <TrackRow track={track} index={i}/>)
                            : (
                                <>
                                    <Tr>
                                        <Td pl={0}><Skeleton>1</Skeleton></Td>
                                        <Td><Skeleton>Test Test Test</Skeleton></Td>
                                        <Td pr={0}><Skeleton>Test</Skeleton></Td>
                                    </Tr>
                                    <Tr>
                                        <Td pl={0}><Skeleton>1</Skeleton></Td>
                                        <Td><Skeleton>Test Test Test</Skeleton></Td>
                                        <Td pr={0}><Skeleton>Test</Skeleton></Td>
                                    </Tr>
                                    <Tr>
                                        <Td pl={0}><Skeleton>1</Skeleton></Td>
                                        <Td><Skeleton>Test Test Test</Skeleton></Td>
                                        <Td pr={0}><Skeleton>Test</Skeleton></Td>
                                    </Tr>
                                    <Tr>
                                        <Td pl={0}><Skeleton>1</Skeleton></Td>
                                        <Td><Skeleton>Test Test Test</Skeleton></Td>
                                        <Td pr={0}><Skeleton>Test</Skeleton></Td>
                                    </Tr>
                                </>
                            )}
                        {(sortedTracks !== null && sortedTracks.length === 0) && (

                            <Tr>
                                <Td colspan={3} pl={0} pr={0}>No tracks were found with this filter.</Td>
                            </Tr>
                        )}
                    </Tbody>
                </Table>
            </Box>
        </VStack>
    );
}

export default ArtistScreen;
