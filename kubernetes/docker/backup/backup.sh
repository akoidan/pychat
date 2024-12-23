set -x
WORK='/src/git'
cd "$WORK"


tables=$(mysql --user=$MYSQL_USER -P $MYSQL_PORT -p$MYSQL_PASSWORD -h $MYSQL_HOST $MYSQL_DATABASE -sse "show tables;")
if [ -z "$tables" ]; then
    echo "Database is not created yet, nothing to backup"
    exit 1
fi

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

#-n      suppress printing
#s       substitute
#^.*     anything at the beginning
#-       up until the @
#\(      start capture group
#\S*     any non-space characters
#\)      end capture group
#-       up until the : charaterd
#.*$     anything at the end
#\1      substitute 1st capture group for everything on line
#p       print it

hostname=$(echo "$GITHUB_REPO" | sed -n "s/^.*\@\(\S*\):.*$/\1/p")

echo detected private repo hostname="$hostname"

ssh-keyscan $hostname > ~/.ssh/known_hosts
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
mysqldump -u $MYSQL_USER -P $MYSQL_PORT -p$MYSQL_PASSWORD -h $MYSQL_HOST --comments=FALSE $MYSQL_DATABASE > "$WORK/data.sql" && \
cd "$WORK/backend/photos" && \
find . -size +25000k  > .gitignore && \
cd "$WORK" && \
git add . && \
commitNoFail && \
git push || exit 1

