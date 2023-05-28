WORK='/src/git'
set -x
cd "$WORK"

commitNoFail() {
  if ! git diff-index --quiet HEAD; then
    git commit -m "periodic refresh at `date`" || exit 1
  fi
}

git config --global user.email "backup@pychat.org"
git config --global user.name "cronjob"
mkdir ~/.ssh -p
cp /src/ssh/id_rsa ~/.ssh/id_rsa
cp /src/ssh/id_rsa.pub ~/.ssh/id_rsa.pub
chmod 600 ~/.ssh/id_rsa
chmod 600 ~/.ssh/id_rsa.pub
ssh-keyscan github.com > ~/.ssh/known_hosts
if [ ! -d "$WORK/.git" ]; then
  git init &&
  git remote add origin $GITHUB_REPO &&
  git fetch &&
  git checkout master -f &&
  git branch --set-upstream-to origin/master || exit 1
fi
# --comments=FALSE to avoid dump-time in dump.sql that allows empty-data commit
git config pull.rebase false
git pull && \
mysqldump -u $MYSQL_USER -p$MYSQL_PASSWORD -h $MYSQL_HOST --comments=FALSE $MYSQL_DATABASE > "$WORK/backend/data.sql" && \
cd "$WORK/backend/photos" && \
find . -size +25000k  > .gitignore && \
cd "$WORK" && \
git add -A && \
commitNoFail && \
git push || exit 1

