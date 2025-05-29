'use client';

import React, { ChangeEvent, FormEvent } from 'react';
import { useState } from 'react';
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { ConnectButton, useCurrentWallet, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/client';

const networks = {
  mainnet: {
    url: 'https://fullnode.mainnet.sui.io',
  },
};

export default function Home() {
  return (
    <SuiClientProvider networks={networks} defaultNetwork="mainnet">
      <WalletProvider autoConnect>
        <div>
          <main className="min-h-screen p-8">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-4xl font-bold mb-8">Sui Token Mint Paneli</h1>
              <div className="mb-8">
                <ConnectButton />
              </div>
              <TokenMintForm />
            </div>
          </main>
        </div>
      </WalletProvider>
    </SuiClientProvider>
  );
}

function TokenMintForm() {
  const wallet = useCurrentWallet();
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenDecimals, setTokenDecimals] = useState('9');
  const [mintAmount, setMintAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const signAndExecute = useSignAndExecuteTransaction();

  const handleMint = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!wallet.currentWallet) {
      alert('Lütfen önce cüzdanınızı bağlayın!');
      return;
    }

    setIsLoading(true);

    try {
      const tx = new Transaction();
      
      const PACKAGE_ID = '0x...'; // Deploy ettiğin package id
      const MODULE_NAME = 'my_token';
      const FUNCTION_NAME = 'mint';
      const TOKEN_TYPE = `${PACKAGE_ID}::${MODULE_NAME}::MY_TOKEN`;
      const TREASURY_CAP_ID = '0x...'; // Explorer'dan bulacağın TreasuryCap objesinin ID'si

      // Token oluşturma işlemi
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::${FUNCTION_NAME}`,
        typeArguments: [TOKEN_TYPE],
        arguments: [
          tx.object(TREASURY_CAP_ID), // TreasuryCap objesi
          tx.pure(wallet.currentWallet?.accounts[0].address ?? ''), // mint edilecek adres
          tx.pure(Number(mintAmount)), // miktar
        ],
      });

      const result = await signAndExecute.mutateAsync({
        transaction: tx,
      });

      console.log('Transaction successful:', result);
      alert('Token başarıyla oluşturuldu!');
    } catch (error) {
      console.error('Error minting token:', error);
      alert('Token oluşturulurken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>, setter: (value: string) => void) => {
    setter(e.target.value);
  };

  return (
    <form onSubmit={handleMint} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Token Adı</label>
        <input
          type="text"
          value={tokenName}
          onChange={(e) => handleInputChange(e, setTokenName)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Token Sembolü</label>
        <input
          type="text"
          value={tokenSymbol}
          onChange={(e) => handleInputChange(e, setTokenSymbol)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Ondalık Basamak</label>
        <input
          type="number"
          value={tokenDecimals}
          onChange={(e) => handleInputChange(e, setTokenDecimals)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Mint Miktarı</label>
        <input
          type="number"
          value={mintAmount}
          onChange={(e) => handleInputChange(e, setMintAmount)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={isLoading || !wallet.currentWallet}
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {isLoading ? 'İşlem Yapılıyor...' : 'Token Oluştur'}
      </button>
    </form>
  );
} 