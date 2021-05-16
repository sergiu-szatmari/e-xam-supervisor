cd api
npm run deploy
cd ../client
git co deploy/client --no-edit
git merge main
npm run deploy
git add .
git ci -m "Deploy"
git co main
cd ..
