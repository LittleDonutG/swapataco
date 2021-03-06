import React, { useState, useEffect } from 'react';
import { TezosToolkit } from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";

import {
  ChakraProvider,
  theme,
  Flex,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useColorModeValue,
  Center,
  Box,
  useToast, 
  Textarea
} from '@chakra-ui/react';

import Popup from './components/Popup';

const Tezos = new TezosToolkit("https://mainnet-tezos.giganode.io");
const wallet = new BeaconWallet({ name: "Swap A Taco" });
const contractAddy = "KT1XtJ6k51y7HpLFLTNv2wBYFhfVMZ6ow3Sz";

function App() {
  const [popupState, setPopupState] = useState(false);

  Tezos.setWalletProvider(wallet);

  document.body.style.overflow = "hidden";

  const toast = useToast();

  const submitTrade = async () => {
    if(await checkConnectionStatus() == false){
      setPopupState(true);
    }else{
      var nftSend = document.getElementById("nftSend").value.split(/\n/);
      var nftReceive = document.getElementById("nftReceive").value.split(/\n/);
      var walletAddress = document.getElementById("walletAddress").value;

      if(nftSend[0].includes(':') && nftReceive[0].includes(':')){
        var opHash = await submitTradeFunction(nftSend, nftReceive, walletAddress);
        if(opHash){
          toast({
            title: "Transaction Submitted :|",
            description: "Awaiting Trade ID...",
            status: "warning",
            duration: 8000,
            isClosable: true,
          });

          var tradeID = await getTradeIDFunction(opHash, false);

          if(tradeID){
            toast({
              title: "Transaction Succeeded :D",
              description: "Trade ID: " + tradeID,
              status: "success",
              duration: 8000,
              isClosable: true,
            });
          }else{
            toast({
              title: "Transaction Failed :(",
              description: "No Trade ID resolved after 2 minutes",
              status: "error",
              duration: 8000,
              isClosable: true,
            });
          }
        }else{
          toast({
            title: "Transaction Failed :(",
            status: "error",
            duration: 8000,
            isClosable: true,
          });
        }
      }else{
        toast({
          title: "Invalid Input :(",
          status: "error",
          duration: 8000,
          isClosable: true,
        });
      }
    }
  };

  const acceptTrade = async () => {
    if(await checkConnectionStatus() == false){
      setPopupState(true);
    }else if(Number.isInteger(Number(document.getElementById("acceptTradeID").value)) == true){
      if(await acceptTradeFunction(document.getElementById("acceptTradeID").value)){
        toast({
          title: "Transaction Submitted :D",
          status: "success",
          duration: 8000,
          isClosable: true,
        });
      }else{
        toast({
          title: "Transaction Failed :(",
          status: "error",
          duration: 8000,
          isClosable: true,
        });
      }
    }else{
      toast({
        title: "Invalid Input :(",
        status: "error",
        duration: 8000,
        isClosable: true,
      });
    }
  };

  const cancelTrade = async () => {
    if(await checkConnectionStatus() == false){
      setPopupState(true);
    }else if(Number.isInteger(Number(document.getElementById("cancelTradeID").value)) == true){
      if(await cancelTradeFunction(document.getElementById("cancelTradeID").value)){
        toast({
          title: "Transaction Submitted :D",
          status: "success",
          duration: 8000,
          isClosable: true,
        });
      }else{
        toast({
          title: "Transaction Failed :(",
          status: "error",
          duration: 8000,
          isClosable: true,
        });
      }
    }else{
      toast({
        title: "Invalid Input :(",
        status: "error",
        duration: 8000,
        isClosable: true,
      });
    }
  };

  const getTradeID = async () => {
    if(document.getElementById("getTradeID").value.length == 51){
      var tradeID = await getTradeIDFunction(document.getElementById("getTradeID").value, true);

      if(tradeID){
        toast({
          title: "Got Trade ID :D",
          description: "Trade ID: " + tradeID,
          status: "success",
          duration: 8000,
          isClosable: true,
        });
      }else{
        toast({
          title: "Trade ID Not Found :(",
          description: "No Trade ID resolved",
          status: "error",
          duration: 8000,
          isClosable: true,
        });
      }
    }else{
      toast({
        title: "Invalid Input :(",
        status: "error",
        duration: 8000,
        isClosable: true,
      });
    }
  };

  const disconnectWallet = async () => {
    setPopupState(true);
    await wallet.clearActiveAccount();
  };

  useEffect(() => {
    const getConnectionStatus = async () => {
      if(await checkConnectionStatus() == false){
        setPopupState(true);
      }
    };
    getConnectionStatus();
  }, []);

  return (
    <ChakraProvider theme={theme}>

      <Popup trigger={popupState} color1={useColorModeValue('gray.50', 'gray.800')} color2={useColorModeValue('white', 'gray.700')} color3={useColorModeValue('gray.800', 'gray.200')}>
        <Button
          bg={'blue.400'}
          rounded={'full'}
          color={'white'}
          flex={'1 0 auto'}
          _hover={{ bg: 'blue.500' }}
          _focus={{ bg: 'blue.500' }}
          onClick={() => connectWallet(setPopupState)}>
          Connect Wallet
        </Button>
      </Popup>

      <Flex
      minH={'1vh'}
      align={'right'}
      justify={'right'}
      padding={'10px'}
      bg={useColorModeValue('gray.50', 'gray.800')}>
        <Stack direction='row' spacing={4}>
          <Button bg={'red.400'}
          color={'white'}
          w="half"
          onClick={disconnectWallet}
          _hover={{
            bg: 'red.500',
          }}>Disconnect</Button>
        </Stack>
      </Flex>

      <Flex
        minH={'90vh'}
        align={'center'}
        justify={'center'}
        bg={useColorModeValue('gray.50', 'gray.800')}>
        <Stack
          spacing={4}
          w={'full'}
          maxW={'md'}
          bg={useColorModeValue('white', 'gray.700')}
          rounded={'xl'}
          boxShadow={'lg'}
          p={6}
          my={12}>
          <Heading lineHeight={1.1} fontSize={{ base: '2xl', sm: '3xl' }}>
          Make A Trade
          </Heading>
          
          <FormControl isRequired>
            <FormLabel>NFT To Send</FormLabel>
            <Textarea 
              placeholder="Contract Address:Token ID"
              _placeholder={{ color: 'gray.500' }}
              id="nftSend"
              resize="none"
              type="text"
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>NFT To Receive</FormLabel>
            <Textarea
              placeholder="Contract Address:Token ID"
              _placeholder={{ color: 'gray.500' }}
              id="nftReceive"
              resize="none"
              type="text"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Non Initiating Wallet Address</FormLabel>
            <Input
              placeholder="Input wallet address of the person trading with you"
              id="walletAddress"
              _placeholder={{ color: 'gray.500' }}
              type="text"
            />
          </FormControl>
          <Stack spacing={6} direction={['column', 'row']}>
            <Button
              bg={'green.400'}
              color={'white'}
              w="full"
              onClick={submitTrade}
              _hover={{
                bg: 'green.500',
              }}>
              Submit Trade
            </Button>
          </Stack>
        </Stack>
        <Stack>
          <Box w='200px' h='10' />
        </Stack>
        <Stack
          spacing={4}
          w={'full'}
          maxW={'md'}
          bg={useColorModeValue('white', 'gray.700')}
          rounded={'xl'}
          boxShadow={'lg'}
          p={6}
          my={12}>
          <Heading lineHeight={1.1} fontSize={{ base: '2xl', sm: '3xl' }}>
            Trade Options
          </Heading>
          <FormControl>
            <FormLabel>Accept Trade</FormLabel>
            <Stack direction={['column', 'row']} spacing={6}>
              <Center>
              <Input
                placeholder="Input Trade ID"
                id="acceptTradeID"
                _placeholder={{ color: 'gray.500' }}
                type="text"
              />
              </Center>
              <Center w="half">
                <Button bg={'green.400'}
                color={'white'}
                w="half"
                onClick={acceptTrade}
                _hover={{
                  bg: 'green.500',
                }}>Accept Trade</Button>
              </Center>
            </Stack>
          </FormControl>
          <FormControl>
            <FormLabel>Cancel Trade</FormLabel>
            <Stack direction={['column', 'row']} spacing={6}>
              <Center>
              <Input
                placeholder="Input Trade ID"
                id="cancelTradeID"
                _placeholder={{ color: 'gray.500' }}
                type="text"
              />
              </Center>
              <Center w="half">
                <Button bg={'red.400'}
                color={'white'}
                w="half"
                onClick={cancelTrade}
                _hover={{
                  bg: 'red.500',
                }}>Cancel Trade</Button>
              </Center>
            </Stack>
          </FormControl>
          <FormControl>
            <FormLabel>Get Trade ID</FormLabel>
            <Stack direction={['column', 'row']} spacing={6}>
              <Center>
              <Input
                placeholder="Input Operation Hash"
                id="getTradeID"
                _placeholder={{ color: 'gray.500' }}
                type="text"
              />
              </Center>
              <Center w="half">
                <Button bg={'yellow.400'}
                color={'white'}
                w="half"
                onClick={getTradeID}
                _hover={{
                  bg: 'yellow.500',
                }}>Get Trade ID</Button>
              </Center>
            </Stack>
          </FormControl>
        </Stack>
      </Flex>
      <Flex
        minH={'10vh'}
        align={'center'}
        justify={'center'}
        bg={useColorModeValue('gray.50', 'gray.800')}></Flex>
    </ChakraProvider>
  );
}

async function connectWallet(setPopupState){
  try {
    console.log("Requesting permissions...");
    const permissions = await wallet.client.requestPermissions();
    if(permissions){
      setPopupState(false);
    }
  } catch (error) {
    console.log("Error while getting permissions:", error);
  }
}

async function checkConnectionStatus(){
  const activeAccount = await wallet.client.getActiveAccount();
  if (activeAccount) {
    console.log("Already connected:", activeAccount.address);
    return true;
  } else {
    console.log("Not connected!");
    return false;
  }
}

async function submitTradeFunction(nftSend, nftReceive, walletAddress){
  const contract = await Tezos.wallet.at(contractAddy);
  const activeAccount = await wallet.client.getActiveAccount();

  var tokensArray = [];
  var forTokensArray = [];

  for(var i = 0; i< nftSend.length; i++){
    tokensArray.push({
      "id": nftSend[i].split(':')[1],
      "fa2": nftSend[i].split(':')[0],
      "amount": "1"
    });
  }

  for(var i = 0; i< nftReceive.length; i++){
    forTokensArray.push({
      "id": nftReceive[i].split(':')[1],
      "fa2": nftReceive[i].split(':')[0],
      "amount": "1"
    });
  }

  try{

    if(walletAddress.length > 0){

      if(walletAddress.length == 36){

        var batch = await Tezos.wallet.batch();
        
        for(var i = 0; i < nftSend.length; i++){
          var updateOperatorArray = [{
            "add_operator":{
              "owner": activeAccount.address,
              "operator": contractAddy,
              "token_id": nftSend[i].split(':')[1]
            }
          }];

          const operatorContract = await Tezos.wallet.at(nftSend[i].split(':')[0]);
          batch.withContractCall(operatorContract.methods.update_operators(updateOperatorArray))
        }

        batch.withContractCall(contract.methods.propose_trade(tokensArray, forTokensArray, walletAddress));

        try{
          var result = await batch.send();
          return result.opHash;
        }catch{
          return false;
        }

      }else{
        return false;
      }
    }else{
      var batch = await Tezos.wallet.batch();
        
      for(var i = 0; i < nftSend.length; i++){
        var updateOperatorArray = [{
          "add_operator":{
            "owner": activeAccount.address,
            "operator": contractAddy,
            "token_id": nftSend[i].split(':')[1]
          }
        }];

        const operatorContract = await Tezos.wallet.at(nftSend[i].split(':')[0]);
        batch.withContractCall(operatorContract.methods.update_operators(updateOperatorArray))
      }

      batch.withContractCall(contract.methods.propose_trade(tokensArray, forTokensArray));
      var result = await batch.send();
      return result.opHash;
    }
  }catch{
    return false;
  }
}

async function acceptTradeFunction(acceptTradeID){
  const contract = await Tezos.wallet.at(contractAddy);
  const activeAccount = await wallet.client.getActiveAccount();

  const response = await fetch(`https://api.tzkt.io/v1/bigmaps/51052/keys/${acceptTradeID}`);
  const parsedBody = await response.json();

  var batch = await Tezos.wallet.batch();

  try{
    for(var i = 0; i < parsedBody.value.tokens2.length; i++){
      var updateOperatorArray = [{
        "add_operator":{
          "owner": activeAccount.address,
          "operator": contractAddy,
          "token_id": parsedBody.value.tokens2[i].id
        }
      }];
  
      const operatorContract = await Tezos.wallet.at(parsedBody.value.tokens2[i].fa2);
      batch.withContractCall(operatorContract.methods.update_operators(updateOperatorArray));
    }

    batch.withContractCall(contract.methods.accept_trade(acceptTradeID));
    var result = await batch.send();
    return result.opHash;
  }catch{
    return false;
  }
}

async function cancelTradeFunction(cancelTradeID){
  const contract = await Tezos.wallet.at(contractAddy);

  try{
    const result = await contract.methods
    .cancel_trade(cancelTradeID)
    .send();

    return result.opHash;
  }catch{
    return false;
  }
}

async function getTradeIDFunction(opHash, skipTime){
  try{
    if(skipTime == false){
      for(var i = 0; i < 12; i++){
        const response = await fetch(`https://api.tzkt.io/v1/operations/${opHash}`);
        const parsedBody = await response.json();
        if(parsedBody.length > 0){
          if(parsedBody[1].diffs[0].content.key){
            return parsedBody[1].diffs[0].content.key;
          }
        }
        await new Promise(r => setTimeout(r, 10000));
      }
      return false;
    }else{
      const response = await fetch(`https://api.tzkt.io/v1/operations/${opHash}`);
      const parsedBody = await response.json();
      if(parsedBody.length > 0){
        if(parsedBody[1].diffs[0].content.key){
          return parsedBody[1].diffs[0].content.key;
        }else{
          return false;
        }
      }else{
        return false;
      }
    }
  }catch{
    return false;
  }
}

export default App;
