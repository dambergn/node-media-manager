#!/bin/bash
#https://thetvdb.com/api-information
#https://github.com/thetvdb/v4-api
#https://thetvdb.github.io/v4-api/
## JQ tutorials
#https://www.youtube.com/watch?v=FSn_38gDvzM
#https://www.youtube.com/watch?v=EIhLl9ebeiA
#https://www.youtube.com/watch?v=uIKvYgix-L4


declare thetvdb_token

function login (){
    AUTH='{
        "apikey": "cc086579-9744-4b42-ae41-c3e90dc5f919",
        "pin": "4ZPQB7CC"
    }'

    curl -sk \
    --request POST \
    --url "https://api4.thetvdb.com/v4/login" \
    --header 'Accept: application/json' \
    --header 'Content-Type: application/json' \
    --data "$AUTH"

}

thetvdb_token=$( login  | jq '.data.token' | tr -d '"' )
# echo $thetvdb_token
if [ -z "$thetvdb_token" ]
then
      echo "There was an error logging in!"
else
      echo "Login Successfull"
fi

# This replaces spaces with %20 for URL strings
function formatter (){
    echo $1 | sed -e 's/ /%20/g'
}

function search (){
    SEARCH=$( formatter "$1" )
    RESULTS= curl -sk \
    --request GET \
    --url "https://api4.thetvdb.com/v4/search?query=$SEARCH&language=eng" \
    --header 'Accept: application/json' \
    --header "Authorization: Bearer $thetvdb_token" > /tmp/tvdb_wkdir/search_results.json

    # ARRAY_LENGTH=$(cat /tmp/tvdb_wkdir/search_results.json | jq ".data | length")
    # echo "$ARRAY_LENGTH Results found"
    for ((i=1; i <=10; i++))
    do
        NAME=$(cat /tmp/tvdb_wkdir/search_results.json | jq ".data[$i].name")
        YEAR=$(cat /tmp/tvdb_wkdir/search_results.json | jq ".data[$i].year")
        STATUS=$(cat /tmp/tvdb_wkdir/search_results.json | jq ".data[$i].status")
        ID=$(cat /tmp/tvdb_wkdir/search_results.json | jq ".data[$i].tvdb_id")

        echo "$NAME | $YEAR | $STATUS | $ID"
    done
}

function artwork (){
    curl -k \
    --request GET \
    --url "https://api4.thetvdb.com/v4/artwork/$1" \
    --header 'Accept: application/json' \
    --header "Authorization: Bearer $thetvdb_token" > /tmp/tvdb_wkdir/artwork_results.json

    cat /tmp/tvdb_wkdir/artwork_results.json | jq "." 
}

function seasons (){
    SEASON_NUMBER = $2
    curl -k \
    --request GET \
    --url "https://api4.thetvdb.com/v4/seasons/$1/extended" \
    --header 'Accept: application/json' \
    --header "Authorization: Bearer $thetvdb_token" > /tmp/tvdb_wkdir/season$2_results.json

    cat /tmp/tvdb_wkdir/seasons_results.json | jq "." 
}

function get_seasons (){
    ARRAY_LENGTH=$(cat /tmp/tvdb_wkdir/series_results.json | jq ".data.seasons | length")
    echo "$ARRAY_LENGTH Seasons found"
    for ((i=0; i <=$ARRAY_LENGTH; i++)); do
        # echo "Current: $(cat /tmp/tvdb_wkdir/series_results.json | jq ".data.seasons[$i].type.type")"
        # FINDING=$(cat /tmp/tvdb_wkdir/series_results.json | jq ".data.seasons[$i].type.type")
        echo "Finding: $FINDING"
        if [ "$FINDING" = "\"official\"" ]; then
            echo "Official Season Found"
            seasons $(cat /tmp/tvdb_wkdir/series_results.json | jq ".data.seasons[$i].id") $(cat /tmp/tvdb_wkdir/series_results.json | jq ".data.seasons[$i].number")
            jq -s '.[0] * .[1]' /tmp/tvdb_wkdir/season$2_results.json /tmp/tvdb_wkdir/tvdb.json
        fi
    done
}

function series (){
    rm -rf /tmp/tvdb_wkdir
    mkdir /tmp/tvdb_wkdir
    curl -sk \
    --request GET \
    --url "https://api4.thetvdb.com/v4/series/$1/extended" \
    --header 'Accept: application/json' \
    --header "Authorization: Bearer $thetvdb_token" > /tmp/tvdb_wkdir/series_results.json

    touch /tmp/tvdb_wkdir/tvdb.json
    jq -s '.[0] * .[1]' /tmp/tvdb_wkdir/series_results.json /tmp/tvdb_wkdir/tvdb.json
    get_seasons

    # cat /tmp/tvdb_wkdir/tvdb_wkdir/series_results.json | jq ".data.seasons" 
}

# seasons "353712" | jq "."

echo "Search TV Shows"
while true
do
  read option
    if [ $(echo $option | head -n1 | cut -d " " -f1) = 'search' ]; then
        echo "Searching: $(echo $option | awk '{$1= ""; print $0}')"
        search $(echo $option | awk '{$1= ""; print $0}')
        unset option
    elif [ $(echo $option | head -n1 | cut -d " " -f1) = 'save' ]; then
        echo "Series ID: $(echo $option | awk '{$1= ""; print $0}')"
        series $(echo $option | awk '{$1= ""; print $0}')
        unset option
    elif [ $(echo $option | head -n1 | cut -d " " -f1) = 'art' ]; then
        echo "Artwork ID: $($option | awk '{$1= ""; print $0}')"
        artwork $(echo $option | awk '{$1= ""; print $0}')
        unset option
    elif [ $(echo $option | head -n1 | cut -d " " -f1) = 'season' ]; then
        echo "Seasons ID: $($option | awk '{$1= ""; print $0}')"
        seasons $(echo $option | awk '{$1= ""; print $0}')
        unset option
    elif [ $(echo $option | head -n1 | cut -d " " -f1) = 'test' ]; then
        series "gravity falls"
    elif [ $option = 'clear' ]; then
        clear
    else
        echo 'Not a valid option.'
  fi
done