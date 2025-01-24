import multer from "multer";



const storage = multer.diskStorage(
    {   //prop 1 // it will provide the dir where to file shoud be saved
        destination: function (req, file, cb) {
            cb(null, "./public/temp");
        },
        //prop2  if you want to coustomise the name of file then ypu can 
        filename: function (req, file, cb) {
            cb(null, file.originalname)
        }
    }
)

export const upload = multer({ storage });

// we will write a controller 
