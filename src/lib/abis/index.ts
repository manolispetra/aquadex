// ============================================================
// lib/abis/index.ts — AquaDex contract ABIs
// ============================================================

export const ERC20_ABI = [
  { name: "name",        type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string"  }] },
  { name: "symbol",      type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string"  }] },
  { name: "decimals",    type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint8"   }] },
  { name: "totalSupply", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { name: "balanceOf",   type: "function", stateMutability: "view",       inputs: [{ name: "account", type: "address" }],                                           outputs: [{ type: "uint256" }] },
  { name: "allowance",   type: "function", stateMutability: "view",       inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }],       outputs: [{ type: "uint256" }] },
  { name: "approve",     type: "function", stateMutability: "nonpayable", inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }],      outputs: [{ type: "bool"    }] },
  { name: "transfer",    type: "function", stateMutability: "nonpayable", inputs: [{ name: "to", type: "address" }, { name: "value", type: "uint256" }],            outputs: [{ type: "bool"    }] },
  { name: "transferFrom",type: "function", stateMutability: "nonpayable", inputs: [{ name: "from", type: "address" }, { name: "to", type: "address" }, { name: "value", type: "uint256" }], outputs: [{ type: "bool" }] },
] as const;

// Minimal ABI just for token lookup (symbol + decimals + name)
export const ERC20_LOOKUP_ABI = [
  { name: "name",     type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { name: "symbol",   type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { name: "decimals", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint8"  }] },
] as const;

export const UNIVERSAL_ROUTER_ABI = [
  {
    name: "exactInputSingle",
    type: "function",
    stateMutability: "payable",
    inputs: [{
      name: "params", type: "tuple",
      components: [
        { name: "tokenIn",          type: "address" },
        { name: "tokenOut",         type: "address" },
        { name: "recipient",        type: "address" },
        { name: "deadline",         type: "uint256" },
        { name: "amountIn",         type: "uint256" },
        { name: "amountOutMinimum", type: "uint256" },
        { name: "preferredV3Fee",   type: "uint24"  },
        { name: "forceV2",          type: "bool"    },
        { name: "forceV3",          type: "bool"    },
      ],
    }],
    outputs: [{ name: "amountOut", type: "uint256" }],
  },
  {
    name: "quoteBest",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "tokenIn",  type: "address" },
      { name: "tokenOut", type: "address" },
      { name: "amountIn", type: "uint256" },
    ],
    outputs: [
      { name: "bestAmountOut", type: "uint256" },
      { name: "bestPool",      type: "uint8"   },
      { name: "bestV3Fee",     type: "uint24"  },
    ],
  },
] as const;

export const V2_ROUTER_ABI = [
  {
    name: "addLiquidity",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenA", type: "address" }, { name: "tokenB", type: "address" },
      { name: "amountADesired", type: "uint256" }, { name: "amountBDesired", type: "uint256" },
      { name: "amountAMin", type: "uint256" }, { name: "amountBMin", type: "uint256" },
      { name: "to", type: "address" }, { name: "deadline", type: "uint256" },
    ],
    outputs: [{ name: "amountA", type: "uint256" }, { name: "amountB", type: "uint256" }, { name: "liquidity", type: "uint256" }],
  },
  {
    name: "addLiquidityETH",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "token", type: "address" },
      { name: "amountTokenDesired", type: "uint256" },
      { name: "amountTokenMin", type: "uint256" }, { name: "amountETHMin", type: "uint256" },
      { name: "to", type: "address" }, { name: "deadline", type: "uint256" },
    ],
    outputs: [{ name: "amountToken", type: "uint256" }, { name: "amountETH", type: "uint256" }, { name: "liquidity", type: "uint256" }],
  },
  {
    name: "removeLiquidity",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenA", type: "address" }, { name: "tokenB", type: "address" },
      { name: "liquidity", type: "uint256" },
      { name: "amountAMin", type: "uint256" }, { name: "amountBMin", type: "uint256" },
      { name: "to", type: "address" }, { name: "deadline", type: "uint256" },
    ],
    outputs: [{ name: "amountA", type: "uint256" }, { name: "amountB", type: "uint256" }],
  },
  {
    name: "swapExactTokensForTokens",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amountIn", type: "uint256" }, { name: "amountOutMin", type: "uint256" },
      { name: "path", type: "address[]" }, { name: "to", type: "address" }, { name: "deadline", type: "uint256" },
    ],
    outputs: [{ name: "amounts", type: "uint256[]" }],
  },
  {
    name: "swapExactETHForTokens",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "amountOutMin", type: "uint256" },
      { name: "path", type: "address[]" }, { name: "to", type: "address" }, { name: "deadline", type: "uint256" },
    ],
    outputs: [{ name: "amounts", type: "uint256[]" }],
  },
  {
    name: "swapExactTokensForETH",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amountIn", type: "uint256" }, { name: "amountOutMin", type: "uint256" },
      { name: "path", type: "address[]" }, { name: "to", type: "address" }, { name: "deadline", type: "uint256" },
    ],
    outputs: [{ name: "amounts", type: "uint256[]" }],
  },
  {
    name: "getAmountsOut",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "amountIn", type: "uint256" }, { name: "path", type: "address[]" }],
    outputs: [{ name: "amounts", type: "uint256[]" }],
  },
] as const;

export const V2_FACTORY_ABI = [
  { name: "getPair",        type: "function", stateMutability: "view", inputs: [{ name: "tokenA", type: "address" }, { name: "tokenB", type: "address" }], outputs: [{ name: "pair", type: "address" }] },
  { name: "allPairs",       type: "function", stateMutability: "view", inputs: [{ name: "", type: "uint256" }], outputs: [{ name: "pair", type: "address" }] },
  { name: "allPairsLength", type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
] as const;

export const V2_PAIR_ABI = [
  { name: "token0",      type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { name: "token1",      type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { name: "totalSupply", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { name: "balanceOf",   type: "function", stateMutability: "view", inputs: [{ name: "owner", type: "address" }], outputs: [{ type: "uint256" }] },
  { name: "getReserves", type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "reserve0", type: "uint112" }, { name: "reserve1", type: "uint112" }, { name: "blockTimestampLast", type: "uint32" }] },
  { name: "approve",     type: "function", stateMutability: "nonpayable", inputs: [{ name: "spender", type: "address" }, { name: "value", type: "uint256" }], outputs: [{ type: "bool" }] },
] as const;

export const POSITION_MANAGER_ABI = [
  {
    name: "mint", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "params", type: "tuple", components: [
      { name: "token0", type: "address" }, { name: "token1", type: "address" },
      { name: "fee", type: "uint24" }, { name: "tickLower", type: "int24" }, { name: "tickUpper", type: "int24" },
      { name: "amount0Desired", type: "uint256" }, { name: "amount1Desired", type: "uint256" },
      { name: "amount0Min", type: "uint256" }, { name: "amount1Min", type: "uint256" },
      { name: "recipient", type: "address" }, { name: "deadline", type: "uint256" },
    ]}],
    outputs: [{ name: "tokenId", type: "uint256" }, { name: "liquidity", type: "uint128" }, { name: "amount0", type: "uint256" }, { name: "amount1", type: "uint256" }],
  },
  { name: "balanceOf", type: "function", stateMutability: "view", inputs: [{ name: "owner", type: "address" }], outputs: [{ type: "uint256" }] },
  { name: "tokenOfOwnerByIndex", type: "function", stateMutability: "view", inputs: [{ name: "owner", type: "address" }, { name: "index", type: "uint256" }], outputs: [{ type: "uint256" }] },
  {
    name: "positions", type: "function", stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      { name: "token0", type: "address" }, { name: "token1", type: "address" },
      { name: "fee", type: "uint24" }, { name: "tickLower", type: "int24" }, { name: "tickUpper", type: "int24" },
      { name: "liquidity", type: "uint128" },
      { name: "feeGrowthInside0LastX128", type: "uint256" }, { name: "feeGrowthInside1LastX128", type: "uint256" },
      { name: "tokensOwed0", type: "uint128" }, { name: "tokensOwed1", type: "uint128" },
    ],
  },
] as const;
