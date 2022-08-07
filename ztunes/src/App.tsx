import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { getCollection, getMintData, getNftData, getSalesData } from "./api";
import {
  Box,
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
  VStack,
} from "@chakra-ui/react";

const appendIpfsGateway = (ipfsHash: string) => {
  return `https://ipfs.infura.io/ipfs/${ipfsHash}`;
};

// Adds a prefix to the image URI to make it a valid URL, in case it's an IPFS hash
export const processImgURI = (url: string) => {
  if (!url) {
    return null;
  }

  const replacedUrl = url.replace("ipfs://", "");

  if (replacedUrl !== url) {
    return appendIpfsGateway(replacedUrl);
  } else {
    return url;
  }
};

function App() {
  const [collectionAddress, setCollectionAddress] = useState(
    "0x25ed58c027921e14d86380ea2646e3a1b5c55a8b"
  );
  const [tokenId, setTokenId] = useState("300");

  const [collectionData, setCollectionData] = useState({});
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
    () => processImgURI(nftData?.token?.token.image?.url as string) as string,
    [nftData]
  );

  const hasAnySales =
    salesData?.sales?.nodes?.length && salesData?.sales?.nodes?.length > 0;

  return (
    <VStack paddingY="10">
      <Heading>NFT historical data explorer 🗺</Heading>

      <Divider />

      <HStack padding="4" spacing="8">
        <VStack spacing="0">
          <FormLabel htmlFor="collectionAddress">
            Collection/contract Address
          </FormLabel>
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
          borderColor="gray.200"
          borderWidth="1px"
          width="fit-content"
          marginTop="4"
          padding="6"
          shadow="md"
          rounded="lg"
        >
          <Image src={imageURI} height="300" />
        </Box>
      ) : (
        <Skeleton height="300px" width="300px" rounded="lg" />
      )}

      <Divider />

      {hasAnySales ? (
        <TableContainer>
          <Table variant="striped">
            <TableCaption>Historical sales data</TableCaption>
            <Thead>
              <Tr>
                <Th>Buyer</Th>
                <Th>Price (USD)</Th>
                <Th>Price (ETH)</Th>
                <Th>Date</Th>
                <Th>Tx Hash</Th>
              </Tr>
            </Thead>

            <Tbody>
              {salesData?.sales.nodes.map(({ sale }: { sale: any }) => {
                return (
                  <Tr key={sale.transactionInfo.transactionHash}>
                    <Td>{sale.buyerAddress}</Td>
                    <Td>
                      ${Math.round(+(sale.price.usdcPrice?.decimal as number))}
                    </Td>
                    <Td>{sale.price.nativePrice.decimal}</Td>
                    <Td>
                      {new Date(
                        sale.transactionInfo.blockTimestamp
                      ).toDateString()}
                    </Td>
                    <Td> {sale.transactionInfo.transactionHash as string}</Td>
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
              Minted by {mint.originatorAddress as string} on{" "}
              {new Date(mint.transactionInfo.blockTimestamp).toDateString()}. Tx
              hash: {mint.transactionInfo.transactionHash as string}
            </Text>
          </VStack>
        );
      })}

      <Text>Current owner - {nftData?.token?.token.owner as string}</Text>
    </VStack>
  );
}

export default App;
