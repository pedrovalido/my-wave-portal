import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import './App.css';
import abi from './utils/WavePortal.json';

const App = () => {
	const [currentAccount, setCurrentAccount] = useState('');
	const [wavesCount, setWavesCount] = useState('');
	const [allWaves, setAllWaves] = useState([]);
	const [message, setMessage] = useState('');
	const contractAddress = '0x255242555Bf6E143d78D85342827eF27692778dA';
	const contractABI = abi.abi;

	const checkIfWalletIsConnected = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				console.log('Make sure you have metamask!');
				return;
			} else {
				console.log('We have the ethereum object', ethereum);
			}

			const accounts = await ethereum.request({ method: 'eth_accounts' });

			if (accounts.length !== 0) {
				const account = accounts[0];
				console.log('Found an authorized account:', account);
				setCurrentAccount(account);
			} else {
				console.log('No authorized account found');
			}
		} catch (error) {
			console.log(error);
		}
	};

	const connectWallet = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				alert('Get MetaMask!');
				return;
			}

			const accounts = await ethereum.request({
				method: 'eth_requestAccounts'
			});

			console.log('Connected', accounts[0]);
			setCurrentAccount(accounts[0]);
		} catch (error) {
			console.log(error);
		}
	};

	const wave = async () => {
		try {
			const { ethereum } = window;

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const wavePortalContract = new ethers.Contract(
					contractAddress,
					contractABI,
					signer
				);

				const waveTxn = await wavePortalContract.wave(message, {
					gasLimit: 300000
				});
				console.log('Mined -- ', waveTxn.hash);

				const count = await wavePortalContract.getTotalWaves();
				console.log(count);
				setWavesCount(parseInt(count, 16));
			} else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch (error) {
			console.log(error);
		}
	};

	const countWaves = async () => {
		try {
			const { ethereum } = window;

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const wavePortalContract = new ethers.Contract(
					contractAddress,
					contractABI,
					signer
				);

				const count = await wavePortalContract.getTotalWaves();
				setWavesCount(parseInt(count, 16));
			} else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch (error) {
			console.log(error);
		}
	};

	const getAllWaves = async () => {
		const { ethereum } = window;

		try {
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const wavePortalContract = new ethers.Contract(
					contractAddress,
					contractABI,
					signer
				);
				const waves = await wavePortalContract.getAllWaves();

				const wavesCleaned = waves.map(wave => {
					return {
						address: wave.waver,
						timestamp: new Date(wave.timestamp * 1000),
						message: wave.message
					};
				});

				setAllWaves(wavesCleaned);
			} else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch (error) {
			console.log(error);
		}
	};

	const changeMessage = async text => {
		setMessage(text);
	};

	useEffect(() => {
		checkIfWalletIsConnected();
		countWaves();
		setMessage('');
		getAllWaves();
	}, []);

	useEffect(() => {
		let wavePortalContract;

		const onNewWave = (from, timestamp, message) => {
			console.log('NewWave', from, timestamp, message);
			setAllWaves(prevState => [
				...prevState,
				{
					address: from,
					timestamp: new Date(timestamp * 1000),
					message: message
				}
			]);
			countWaves();
			setMessage('');
		};

		if (window.ethereum) {
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const signer = provider.getSigner();

			wavePortalContract = new ethers.Contract(
				contractAddress,
				contractABI,
				signer
			);
			wavePortalContract.on('NewWave', onNewWave);
		}

		return () => {
			if (wavePortalContract) {
				wavePortalContract.off('NewWave', onNewWave);
			}
		};
	}, []);

	return (
		<div className="mainContainer">
			<div className="dataContainer">
				<div className="header">👋 Yo Yo Yo 👋</div>

				<div className="bio">I'm Mr Waver! Wave at Meeee!</div>

				{!currentAccount && (
					<button className="connectButton" onClick={connectWallet}>
						Connect Wallet
					</button>
				)}

				{currentAccount && (
					<div>
						<div className="waveTextAndButton">
							<input
								className="messageBox"
								type="text"
								value={message}
								onChange={e => changeMessage(e.target.value)}
							/>
							<button className="waveButton" onClick={wave}>
								Wave
							</button>
						</div>
						<div className="waves">Total waves: {wavesCount}</div>
					</div>
				)}

				{allWaves.map((wave, index) => {
					return (
						<div
							key={index}
							style={{
								backgroundColor: 'OldLace',
								marginTop: '16px',
								padding: '8px'
							}}
						>
							<div>Address: {wave.address}</div>
							<div>Time: {wave.timestamp.toString()}</div>
							<div>Message: {wave.message}</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default App;
