
let currentSong = new Audio();
currentSong.volume = 0.25;
let songs;
let currFolder;
function secondsToMinutes(seconds) {
    // Calculate minutes and seconds
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);

    // Format minutes and seconds to be two digits
    let formattedMinutes = String(minutes).padStart(2, '0');
    let formattedSeconds = String(remainingSeconds).padStart(2, '0');

    // Combine the formatted minutes and seconds
    return `${formattedMinutes}:${formattedSeconds}`;
}


const getsongs = async (folder) => {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3.preview")) {
            songs.push(element.href.slice(0, -8).split(`/${folder}/`)[1]);
        }
    }

    //show all the songs in library
    let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUl.innerHTML = "";
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li><img src="img/music.svg" alt="">
                            <div class="songinfo">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>${"Naruto"}</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" width="20" src="img/play.svg" alt="">
                            </div>
                        </li>
        `;
    }

    //attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector(".songinfo").firstElementChild.innerHTML);
            playMusic(e.querySelector(".songinfo").firstElementChild.innerHTML)
        })
    });
};

const playMusic = (track, pause = false) => {
    // audio=new Audio("/songs/"+track);
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    // document.querySelector(".circle").style.left= 0 + "%";
    document.querySelector(".info").innerHTML = decodeURI(track);
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    let b = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await b.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors= div.getElementsByTagName("a");
    let cardContainer=document.querySelector(".cardContainer");
    let array=Array.from(anchors);
    for(let index=0;index<array.length;index++){
        const e =array[index];    
        if(e.href.includes("/songs/")){
            let folder=e.href.split("/").slice(-2)[0];
            //get metadata of folder
            let b = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
            let response = await b.json();
            console.log(response);
            cardContainer.innerHTML=cardContainer.innerHTML+
                    `<div data-folder="${folder}" class="card">
                        <div class="playbtn">
                            <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="20"
                                height="20"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                                <path
                                    d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z" />
                            </svg>
                        </div>
                        <img src= "/songs/${folder}/${response.image}" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    };
        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                //current target return the element on which listener is added while target returns the element on which its clicked
                await getsongs(`songs/${item.currentTarget.dataset.folder}`);
                // playMusic(songs[0], true);
                // play.src = "play.svg";
                // document.querySelector(".circle").style.left = 0 + "%";
                
            })
        });
    
}

async function main() {
    //Get all songs
    await getsongs("songs/cs");
    playMusic(songs[0], true);


    //display the libraries
    displayAlbums();


    //attach an event listener to butttons
    //we can access the ids direclty from document
    // let play=document.querySelector("#play");
    // console.log(play);
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        }
        else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    //listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime,currentSong.duration);
        document.querySelector(".songTime").innerHTML = `${secondsToMinutes(currentSong.currentTime)} / ${secondsToMinutes(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        if (currentSong.currentTime == currentSong.duration) {
            play.src = "img/play.svg";
        }
    })

    //add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener(("click"), (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
        // (e.offsetX/e.getBoundingClientRect().width);
    })


    //add an event listner on hamburger
    document.querySelector(".hamburger").addEventListener(("click"), (e) => {
        document.querySelector(".left").style.left = "0";
    });

    //add an event listener on close
    document.querySelector(".close").addEventListener(("click"), () => {
        document.querySelector(".left").style.left = "-150%";
    })

    //add event listner on previous and next
    previous.addEventListener("click", () => {
        let ind = songs.indexOf(currentSong.src.split("/").splice(-1)[0])
        if (ind - 1 >= 0) {
            playMusic(songs[ind - 1]);
        }
    });
    next.addEventListener("click", () => {
        // console.log("next clicked");
        let ind = songs.indexOf(currentSong.src.split("/").splice(-1)[0])
        if ((ind + 1) < songs.length) {
            playMusic(songs[ind + 1]);
        }
    });

    //add eventlistener to volume range
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log(e, e.target, e.target.value);
        currentSong.volume = parseInt(e.target.value) / 100;
    });
    let curval;
    vol.addEventListener("click", () => {
        console.log("volume logo clicked");
        if (currentSong.volume > 0) {
            vol.src = "img/mute.svg";
            curval = currentSong.volume;
            console.log(curval);
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            vol.src = "img/volume.svg";
            console.log(curval);
            currentSong.volume = curval;
            document.querySelector(".range").getElementsByTagName("input")[0].value = curval * 100;
        }
    });

    //load the playlist whenever the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            //current target return the element on which listener is added while target returns the element on which its clicked
            await getsongs(`songs/${item.currentTarget.dataset.folder}`);
            // playMusic(songs[0], true);
            // play.src = "play.svg";
            // document.querySelector(".circle").style.left = 0 + "%";
        })
    });

}





main();