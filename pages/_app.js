import '../styles/globals.css'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import Link from 'next/link'
import { css } from '@emotion/css'
import { AppContext } from '../context'
import ProfileSetup from '../components/ProfileSetup'
import HYVESOCIAL_ABI from '../abi/hyvesocial.json'

const HYVESOCIAL_CONTRACT = '0xd9145CCE52D386f254917e481eB44e9943F39138'
const HYVE_CHAIN_ID = '0x23f8' // 9200 in hex

function MyApp({ Component, pageProps }) {
  const [connected, setConnected] = useState(false)
  const [address, setAddress] = useState('')
  const [profile, setProfile] = useState(null)
  const [needsProfile, setNeedsProfile] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkConnection()
  }, [])

  async function checkConnection() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.listAccounts()
        
        if (accounts.length > 0) {
          const signer = await provider.getSigner()
          const userAddress = await signer.getAddress()
          setAddress(userAddress)
          setConnected(true)

          // Check if on Hyve network
          const network = await provider.getNetwork()
          if (network.chainId !== BigInt(9200)) {
            await switchToHyve()
          }

          // Check for profile
          await checkProfile(userAddress)
        }
      } catch (error) {
        console.error('Connection check error:', error)
      }
    }
    setLoading(false)
  }

  async function checkProfile(userAddress) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(
        HYVESOCIAL_CONTRACT,
        HYVESOCIAL_ABI,
        provider
      )

      const profileData = await contract.getProfile(userAddress)
      
      if (profileData[0]) { // username exists
        setProfile({
          username: profileData[0],
          bio: profileData[1],
          avatarUrl: profileData[2],
          createdAt: profileData[3],
          address: userAddress
        })
        setNeedsProfile(false)
      } else {
        setNeedsProfile(true)
      }
    } catch (error) {
      console.log('Profile check:', error.message)
      if (error.message.includes('Profile does not exist')) {
        setNeedsProfile(true)
      }
    }
  }

  async function switchToHyve() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: HYVE_CHAIN_ID }],
      })
    } catch (switchError) {
      // Chain not added, try to add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: HYVE_CHAIN_ID,
              chainName: 'Hyve Blockchain',
              nativeCurrency: {
                name: 'HYVE',
                symbol: 'HYVE',
                decimals: 18
              },
              rpcUrls: ['https://rpc.hyvechain.com'],
              blockExplorerUrls: null
            }],
          })
        } catch (addError) {
          console.error('Error adding Hyve network:', addError)
        }
      }
    }
  }

  async function signIn() {
    try {
      if (typeof window.ethereum === 'undefined') {
        alert('Please install MetaMask!')
        return
      }

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      })
      
      const userAddress = accounts[0]
      setAddress(userAddress)
      setConnected(true)

      // Switch to Hyve network
      await switchToHyve()

      // Check for profile
      await checkProfile(userAddress)

    } catch (error) {
      console.error('Sign in error:', error)
      alert('Failed to connect wallet')
    }
  }

  async function handleProfileCreated() {
    // Reload profile after creation
    await checkProfile(address)
    setNeedsProfile(false)
  }

  // Show profile setup if user needs to create profile
  if (connected && needsProfile && !loading) {
    return (
      <AppContext.Provider value={{ profile, address, setProfile }}>
        <ProfileSetup onProfileCreated={handleProfileCreated} />
      </AppContext.Provider>
    )
  }

  return (
    <AppContext.Provider value={{ profile, address, setProfile }}>
      <div>
        <nav className={navStyle}>
          <div className={headerStyle}>
            <Link href="/" className={linkStyle}>
              <img src='/hyve-logo.png' className={iconStyle} />
              <p className={titleStyle}>HYVE SOCIAL</p>
            </Link>
            <div className={navLinksStyle}>
              <Link href="/" className={navLinkStyle}>Home</Link>
              <Link href="/profiles" className={navLinkStyle}>Explore Profiles</Link>
              {connected && profile && (
                <div className={profileInfoStyle}>
                  <span className={usernameStyle}>@{profile.username}</span>
                  <span className={addressStyle}>
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </span>
                </div>
              )}
            </div>
            {!connected && (
              <div onClick={signIn} className={buttonStyle}>
                <p className={buttonTextStyle}>Sign In</p>
              </div>
            )}
          </div>
        </nav>
        <div className={containerStyle}>
          <Component {...pageProps} />
        </div>
      </div>
    </AppContext.Provider>
  )
}

export default MyApp

const usernameStyle = css`
  font-weight: 600;
  color: rgb(249, 92, 255);
`

const addressStyle = css`
  font-size: 12px;
  color: #999;
`

const profileInfoStyle = css`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-right: 20px;
`

const navLinksStyle = css`
  display: flex;
  align-items: center;
  gap: 30px;
  flex: 1;
  justify-content: center;
`

const navLinkStyle = css`
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
  &:hover {
    color: rgb(249, 92, 255);
  }
`

const iconStyle = css`
  width: 50px;
`

const linkStyle = css`
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
`

const navStyle = css`
  background-color: #1a1a1a;
  padding: 20px 40px;
  display: flex;
  justify-content: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`

const headerStyle = css`
  max-width: 1200px;
  width: 100%;
  display: flex;
  align-items: center;
`

const titleStyle = css`
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin: 0;
  letter-spacing: 1px;
`

const buttonStyle = css`
  background-color: rgb(249, 92, 255);
  padding: 10px 30px;
  border-radius: 50px;
  cursor: pointer;
  transition: all .35s;
  &:hover {
    background-color: rgba(249, 92, 255, .75);
  }
`

const buttonTextStyle = css`
  color: #340036;
  font-weight: 600;
  font-size: 16px;
  margin: 0;
`

const containerStyle = css`
  padding-top: 20px;
`
