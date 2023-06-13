import {
    Box, SlideFade, Stack,
} from '@chakra-ui/react';
import {Container, Flex, LinkBox, LinkOverlay, SimpleGrid, Spacer} from '@chakra-ui/layout';
import {Alert, AlertDescription, AlertIcon} from '@chakra-ui/alert';
import {CloseButton} from '@chakra-ui/close-button';
import {useState} from 'react';
import {Image} from '@chakra-ui/image';

function Footer() {

    const [alertVisible, setAlertVisible] = useState(true);
    return (
        <>
            <Box flex="0 0 auto" bg="gray.900">
                <Container maxW={"1000px"} mb={6} mt={6} pl={7} pr={7}>
                    <Flex align='center'>
                        <Box color={"gray.600"} mr={3}>
                            Built by Chris Dalke &middot; <a href="https://github.com/chrisdalke">github.com/chrisdalke</a> &middot; <a href="https://www.buymeacoffee.com/chrisdalke">Buy me a Coffee</a>
                        </Box>
                        <Spacer />
                        <Box>
                            <a
                                href="https://www.producthunt.com/posts/timelineify?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-timelineify"
                                target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=286264&theme=dark"
                                                    alt="Timelineify - Create Spotify playlists of an artist's full discography | Product Hunt"
                                                    style={{
                                                        width: '250px',
                                                        height: '54px'
                                                    }}
                                                    width="250"
                                                    height="54" /></a>
                        </Box>
                    </Flex>
                </Container>
            </Box>
        </>
    );
}

export default Footer;
