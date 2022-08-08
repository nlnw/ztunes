import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { getCollection, getMintData, getNftData, getSalesData } from "./api";
import {
  Box,
  Button,
  Divider,
  FormLabel,
  Heading,
  HStack,
  Image,
  Input,
  Skeleton,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import songs from "./songs.json";
import { useNavigate, useParams } from "react-router-dom";

const appendIpfsGateway = (ipfsHash: string) => {
  return `https://zora-prod.mypinata.cloud/ipfs/${ipfsHash}`;
};

const processIpfsUri = (url: string) => {
  if (!url) {
    return "";
  }

  const replacedUrl = url
    .replace("ipfs://", "")
    .replace("^https://ipfs.io/ipfs/", "");

  if (replacedUrl !== url) {
    return appendIpfsGateway(replacedUrl);
  } else {
    return url;
  }
};

const getRandomSong = () => {
  return songs[Math.floor(Math.random() * songs.length)];
};

function App() {
  const params = useParams();
  const navigate = useNavigate();

  const randomSong = getRandomSong();
  const [collectionAddress, setCollectionAddress] = useState(
    params.collection || randomSong[0]
  );
  const [tokenId, setTokenId] = useState(params.tokenId || randomSong[1]);

  const [, setCollectionData] = useState({});
  const [salesData, setSalesData]: [any, any] = useState({});
  const [mintData, setMintData]: [any, any] = useState({});
  const [nftData, setNftData]: [any, any] = useState({});

  useEffect(() => {
    (async () => {
      const collectionData = await getCollection(collectionAddress);
      const mintData = await getMintData(collectionAddress, tokenId);
      const salesData = await getSalesData(collectionAddress, tokenId);
      const nftData = await getNftData(collectionAddress, tokenId);

      console.log({ collectionData });
      console.log({ mintData });
      console.log({ salesData });
      console.log({ nftData });

      setCollectionData(collectionData);
      setMintData(mintData);
      setSalesData(salesData);
      setNftData(nftData);
    })();
  }, [collectionAddress, tokenId]);

  const imageURI = useMemo(
    () => processIpfsUri(nftData?.token?.token.image?.url as string),
    [nftData]
  );

  const hasAnySales =
    salesData?.sales?.nodes?.length && salesData?.sales?.nodes?.length > 0;

  const nextSong = () => {
    const randomSong = getRandomSong();
    navigate(`../../${randomSong[0]}/${randomSong[1]}`, { replace: true });
    setCollectionAddress(randomSong[0]);
    setTokenId(randomSong[1]);
  };

  const { toggleColorMode } = useColorMode();

  return (
    <VStack paddingY="10">
      <Heading>
        zTunes <button onClick={toggleColorMode}>🎸</button>
      </Heading>

      <Divider />

      <HStack padding="4" spacing="8">
        <VStack spacing="0">
          <FormLabel htmlFor="collectionAddress">Collection</FormLabel>
          <Input
            id="collectionAddress"
            value={collectionAddress}
            onChange={(e) => setCollectionAddress(e.target.value)}
          />
        </VStack>

        <VStack spacing="0">
          <FormLabel htmlFor="tokenId">Token ID</FormLabel>
          <Input
            id="tokenId"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
          />
        </VStack>
      </HStack>

      <Divider />
      {imageURI ? (
        <Box
          borderWidth="1px"
          width="fit-content"
          marginTop="4"
          padding="6"
          shadow="md"
          fontWeight="bold"
        >
          <Text>{nftData?.token?.token.name}</Text>
          <br />
          <a
            href={`https://zora.co/collections/${collectionAddress}/${tokenId}`}
            target="_blank"
          >
            <Image src={imageURI} height="300" />
          </a>
        </Box>
      ) : (
        <Skeleton height="300px" width="300px" rounded="lg" />
      )}

      <audio
        controls
        autoPlay
        src={processIpfsUri(nftData?.token?.token.content?.url)}
        onEnded={nextSong}
      />

      <HStack>
        <Button disabled>Prev</Button>
        <Button onClick={nextSong}>Next</Button>
      </HStack>

      <Divider />

      {hasAnySales ? (
        <TableContainer>
          <Table size="sm" variant="striped">
            <TableCaption>Historical sales data</TableCaption>
            <Thead>
              <Tr>
                <Th>Buyer</Th>
                <Th>Price</Th>
                {/* <Th>Price (ETH)</Th> */}
                <Th>Date</Th>
                {/* <Th>Tx Hash</Th> */}
              </Tr>
            </Thead>

            <Tbody>
              {salesData?.sales.nodes.map(({ sale }: { sale: any }) => {
                return (
                  <Tr key={sale.transactionInfo.transactionHash}>
                    <Td>
                      <a
                        href={`https://etherscan.io/address/${sale.buyerAddress}`}
                        target="_blank"
                      >
                        {sale.buyerAddress.substring(0, 5)}
                      </a>
                    </Td>
                    <Td>
                      ${Math.round(+(sale.price.usdcPrice?.decimal as number))}
                    </Td>
                    {/* <Td>{sale.price.nativePrice.decimal}</Td> */}
                    <Td>
                      {new Date(
                        sale.transactionInfo.blockTimestamp
                      ).toDateString()}
                    </Td>
                    {/* <Td> {sale.transactionInfo.transactionHash as string}</Td> */}
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>
      ) : (
        <Text>No sales data found</Text>
      )}

      <Divider />

      {mintData?.mints?.nodes.map(({ mint }: { mint: any }) => {
        return (
          <VStack key={mint.transactionInfo.transactionHash}>
            <Text>
              Minted by{" "}
              <a
                href={`https://etherscan.io/address/${mint.originatorAddress}`}
                target="_blank"
              >
                {mint.originatorAddress.substring(0, 5)}
              </a>{" "}
              on {new Date(mint.transactionInfo.blockTimestamp).toDateString()}.
            </Text>
            <Text>
              Tx hash:{" "}
              <a
                href={`https://etherscan.io/tx/${mint.transactionInfo.transactionHash}`}
                target="_blank"
              >
                {mint.transactionInfo.transactionHash.substring(0, 5)}
              </a>
            </Text>
          </VStack>
        );
      })}

      <Text>
        Current owner -{" "}
        <a
          href={`https://etherscan.io/address/${nftData?.token?.token.owner}`}
          target="_blank"
        >
          {nftData?.token?.token.owner.substring(0, 5)}
        </a>
      </Text>

      <Divider />
      <Text>
        Powered by <a href="https://zora.co">Zora</a>
      </Text>
    </VStack>
  );
}

export default App;
