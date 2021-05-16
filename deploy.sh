cd api
npm run deploy
cd ../client
git co deploy/client
git merge main --no-edit
npm run deploy
git add .
git ci -m "Deploy"
git co main
cd ..
