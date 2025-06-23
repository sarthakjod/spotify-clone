let currentsong = new Audio();
let songs;
let currfolder;
function formatTime(totalSeconds) {
    // Check for invalid inputs
    if (typeof totalSeconds !== 'number' || isNaN(totalSeconds) || totalSeconds < 0) {
        return '00:00';
    }
    totalSeconds = Math.floor(totalSeconds);
    let mins = Math.floor(totalSeconds / 60);
    let secs = totalSeconds % 60;

    return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
}



async function getsongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/spotify-clone/${folder}`)
    let reponse = await a.text();
    let div = document.createElement("div")
    div.innerHTML = reponse;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`${folder}/`)[1])
        }
    }
    return songs;
}
const playMusic = (track, pause = false) => {
    currentsong.src = `${currfolder}/` + track
    if (!pause) {
        currentsong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "0:00/0:00"
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = " "
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                                <img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                            <div class="empty"></div>
                                <div> ${song.replaceAll("%20", " ")}</div>
                                <div class="empty"></div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div></li>`;
    }
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").children[1].textContent.trim())

        })

    })
    
}
async function displayAlbum() {
    let res = await fetch(`http://127.0.0.1:5500/spotify-clone/songs/`);
    let text = await res.text();
    let div = document.createElement("div");
    div.innerHTML = text;

    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");

    for (let e of anchors) {
        // Only continue if href includes /songs/
        if (!e.href.includes("/songs/")) continue;

        let part = e.href.split("/songs/")[1];
        if (!part) continue; // safely skip bad hrefs

        let folder = part.replace("/", "");

        try {
            let metaRes = await fetch(`http://127.0.0.1:5500/spotify-clone/songs/${folder}/info.json`);
            let info = await metaRes.json();

            cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black">
                            <g transform="translate(1, -3.5)">
                                <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" stroke="black" stroke-width="1.2" stroke-linejoin="round" />
                            </g>
                        </svg>
                    </div>
                    <img src="songs/${folder}/cover.jpg" alt="">

                    <h2>${info.title}</h2>
                    <p>${info.description}</p>
                </div>
            `;
        } catch (err) {
            console.warn(`info.json missing or invalid in: ${folder}`);
        }
    }

    // Add click listeners
    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", async () => {
            await getsongs(`songs/${card.dataset.folder}`);
            playMusic(songs[0]);
        });
    });
}

async function main() {

    await getsongs("songs/Raftaar")
    playMusic(songs[0], true)

    displayAlbum()

    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentsong.pause()
            play.src = "img/play.svg"
        }
    })
    currentsong.addEventListener("timeupdate", () => {
        console.log(currentsong.currentTime, currentsong.duration)
        document.querySelector(".songtime").innerHTML = `${formatTime(currentsong.currentTime)}/${formatTime(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%"

    })
    document.querySelector(".seekbar").addEventListener("click", e => {
        percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%"
        currentsong.currentTime = ((currentsong.duration) * percent) / 100
    })

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0;
    })
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })
    prev.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentsong.volume = parseInt(e.target.value) / 100
        if(currentsong.volume>0){
            document.querySelector(".volume>img").src=document.querySelector(".volume>img").src.replace("mute.svg","volume.svg")
        }
    })
    document.querySelector(".volume>img").addEventListener("click",e=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src=e.target.src.replace("volume.svg","mute.svg");
            currentsong.volume=0;
            document.querySelector(".range").getElementsByTagName("input")[0].value=0;
        }
        else{        
        e.target.src=e.target.src.replace("mute.svg","volume.svg")
        currentsong.volume=.10;
        document.querySelector(".range").getElementsByTagName("input")[0].value=10;
        }
})

}
main()