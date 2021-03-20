
require('dotenv').config();
var uuidv4 = require('uuid/v4');
const fs = require('fs')
const genThumbnail = require('simple-thumbnail')
import nextConnect from 'next-connect';
const { initMinter, stopMinter, mintNFT, getNFT, createSignInRequest } = require('../../src/api/NFT');
import multer from 'multer';
let minterPrepped = false;

// Returns a Multer instance that provides several methods for generating 
// middleware that process files uploaded in multipart/form-data format.
const upload = multer({
  storage: multer.diskStorage({
    destination: './public/uploads',
    filename: function(req, file, cb) {
      cb(null, "video.webm");
    }
  }),
});

const apiRoute = nextConnect();


apiRoute.post(upload.single('video'), async (req, res) => {

console.log("FILE IS")
console.log(req.file);

  // if(!minterPrepped){
  //   await initMinter(process.env.SECRET).then(() => {
  //     console.log("Minter prepped");
  //     minterPrepped = true;
  //   })
  // }


  console.log("Upload file request received");
  if (!req.file) {
    console.log("No file uploaded");

    return res.status(400).json({ msg: 'No file uploaded' });
  }
  const fileName = uuidv4() + '.webm';

  console.log("Filename is", fileName)

  const file = req.file;

  console.log("File is", file);
  file.name = fileName

  console.log("Dirname is", __dirname);
  console.log("Filename is", `./public/uploads/${fileName}`);

  fs.readdir(`./public/uploads`, (err, files) => {
    if(err) console.error(err);
    files.forEach(file => {
      console.log(file);
    });
  });

  fs.renameSync(`./public/uploads/video.webm`, `./public/uploads/${fileName}`)

    console.log("CWD is", process.cwd());

    await genThumbnail(`${process.cwd()}/public/uploads/${fileName}`, `${process.cwd()}/public/uploads/${fileName.replace('webm', 'png')}`, '512x?').catch(err => {
      console.log(err);
    })
    console.log(" CREATING NFT DATA:")
    console.log("Location is ", req.location);
    console.log("Location could also be ", req.body.location);

    console.log(req.body)
    const nftData = {
      location: req.body.location,
      media: fs.readFileSync(`./public/uploads/${fileName}`),
      thumbnail: fs.readFileSync(`./public/uploads/${fileName.replace('webm', 'png')}`),
      metadata: '' // if we want like text or whatever
    }

    // const nftResponse = await mintNFT(nftData, req.body.user_token);
    console.log("**** NFT MINTED");
    // if (!nftResponse) {
    //   return res.status(500).json({ msg: 'Failed to mint token, try again soon.' });
    // }
    // console.log(nftResponse);
    // await fs.rm(`./public/uploads/${fileName}`);
    // await fs.rm(`./public/uploads/${fileName.replace('webm','png')}`);

    // TODO: Change the thumbnail URL as it is currently hardcoded
    res.json({
      ...nftData,
      // ...nftResponse,
      thumbnailUrl: `/uploads/${fileName.replace('webm', 'png')}`
    });
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false,
  },
}