import { ZDK, ZDKNetwork, ZDKChain } from "@zoralabs/zdk";
import {
  SaleSortKey,
  SortDirection,
} from "@zoralabs/zdk/dist/queries/queries-sdk";

const networkInfo = {
  network: ZDKNetwork.Ethereum,
  chain: ZDKChain.Mainnet,
};

const API_ENDPOINT = "https://api.zora.co/graphql";
const args = {
  endPoint: API_ENDPOINT,
  networks: [networkInfo],
};

const zdk = new ZDK(args);

// Query for an NFT collection by its contract address and return some metadata
export const getCollection = async (collectionAddress: string) => {
  const { name, symbol, totalSupply, description } = await zdk.collection({
    address: collectionAddress,
  });

  return {
    name,
    symbol,
    totalSupply,
    description,
  };
};

// Query for mint data for a given NFT
export const getMintData = async (
  collectionAddress: string,
  tokenId: string
) => {
  const { mints } = await zdk.mints({
    where: {
      tokens: [
        {
          address: collectionAddress,
          tokenId,
        },
      ],
    },
    includeFullDetails: true,
  });
  return {
    mints,
  };
};

// Query for sales data for a given NFT data
export const getSalesData = async (
  collectionAddress: string,
  tokenId: string
) => {
  const { sales } = await zdk.sales({
    where: {
      tokens: [
        {
          address: collectionAddress,
          tokenId,
        },
      ],
    },
    sort: {
      sortKey: SaleSortKey.Time,
      sortDirection: SortDirection.Desc,
    },
    filter: {},
    includeFullDetails: true,
  });

  return {
    sales,
  };
};

// Query for miscellaneous data for a given NFT
export const getNftData = async (
  collectionAddress: string,
  tokenId: string
) => {
  const { token } = await zdk.token({
    token: {
      address: collectionAddress,
      tokenId,
    },
  });

  return {
    token,
  };
};
