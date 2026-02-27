export const MintNFTForm = () => {

    const mintNFT = () => {
        alert("Minting NFT...");
    }

    return (
        <div>
            <div className="m-auto d-block w-50 bg-red-500 p-5 text-center" onClick={mintNFT}>Mint NFT</div>
        </div>
    )
}