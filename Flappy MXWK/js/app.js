import { getRandomNumber, getCssProp, detectColision, roundNum } from '/utils/utils.js'


Object.assign( window, {
  detectColision
} )


let game, block, hole, character, score, gameoverscreen, star, gameStopped, isJumping, scoreTotal, gameSpeed, gravityStopped

function getElements() {
  game = document.querySelector('#game')
  block = document.querySelector('#block')
  hole = document.querySelector('#hole')
  character = document.querySelector('#character')
  score = document.querySelector('#score')
  gameoverscreen = document.querySelector('#gameoverscreen')
  star = document.querySelector('#star')
}

function setInitialValues(){
  gameStopped = false;
  isJumping = false;
  isJumping = 0;
  scoreTotal = 0;
  gameSpeed = 'slow';
  gravityStopped = false;

}

function setEventListeners() {
  window.addEventListener( 'resize', _ => {
    if (gameStopped) return
    resetAllAnimations()
  })

  gameoverscreen.querySelector('button').addEventListener('click', _ =>{
    gameSpeed = 'slow'
    hideGameoverscreen()
    startGravity()
    resetAllAnimations()
    resetCharacterPosition()
    resetScore()
    changeScoreUi()
    startBgAnimation()

    setTimeout(_ => {
      gameStopped = false
    })





  })
}

document.body.parentElement.addEventListener('click', _ => {
  if (gameStopped) return
  characterJump()
})

document.onkeypress = e => {
  e = e || window.event

  if (e.keyCode === 32) {
    if (gameStopped) return
    characterJump()
  }
}

function gameOver() {
  (new Audio('/audio/gameover.wav')).play()
  gameStopped = true
  showGameoverscreen()
  stopBlockAnimation()
  stopGravity()
  hideStar()
  stopBgAnimation()

 console.log("gameover")
}


function resetCharacterPosition() {
  character.style.top = '30vh'
  character.style.left = '25vw'

}



function resetScore() {
  scoreTotal = 0
}

function changeScoreUi() {
  score.innerText = `Score ${scoreTotal.toString()}`
  gameoverscreen.querySelector('.score').innerText = score.innerText

}

const gamespeedConfig = {
  'slow' : 250,
  'normal' : 550,
  'fast' : 850,
  'superfast' : 950,
  'ridiculous' : 1000
}

function resetAllAnimations() {
  const seconds = roundNum(window.innerWidth / gamespeedConfig[gameSpeed])
  const blockAnimationCss = `blockAnimation ${seconds}s infinite linear`

  block.style.animation = blockAnimationCss
  hole.style.animation = blockAnimationCss
  

  //random star implementation

}

function stopBlockAnimation() {
  const blockLeft = block.getBoundingClientRect().x

  block.style.animation = ''
  hole.style.animation = ''

  block.style.left = `${blockLeft}px`
  hole.style.left = `${blockLeft}px`
  
}

function characterJump() {
  isJumping = true
  let jumpCount = 0

  const jumpInterval = setInterval( _ => {
    changeGameState({diff: -3, direction: 'up'})

    if (jumpCount > 20) {
      (new Audio('/audio/fly.wav')).play()
      clearInterval(jumpInterval)
      isJumping = false
      jumpCount = 0
    }

    jumpCount++
  }, 10)
}

function changeGameState({diff, direction}) {
  handleStarDetection()
  handleGameSpeed()
  handleCharacterAnimation(direction)
  handleCharacterCollisions()
  handleCharacterPosition(diff)
}

function handleStarDetection() {
  if (star.style.display === 'none') return

  if (detectColision(character, star)) {
    (new Audio('/audio/star.wav')).play()
    scoreTotal += 150
    hideStar()
    changeScoreUi()
    showStar()
    
  }

}


function handleGameSpeed() {
  let doReset = false

  if (scoreTotal > 750) {
    gameSpeed = 'ridiculous'
    doReset = true
  }
  else if (scoreTotal > 550) {
    gameSpeed = 'superfast'
    doReset = true
  }
  else if (scoreTotal > 350) {
    gameSpeed = 'fast'
    doReset = true
  }
  else if (scoreTotal > 150) {
      gameSpeed = 'normal'
      doReset = true
  }

  if (doReset) {
    const timeoutLegth = gamespeedConfig[gameSpeed] * (gamespeedConfig[gameSpeed] / 10)
    setTimeout( _ =>{
      if (gameStopped) return

      resetAllAnimations()
    }, timeoutLegth)

  }
}

function handleCharacterAnimation(direction){
  if (direction === 'down') {
    character.classList.remove('go-up')
    character.classList.add('go-down')
  }
  else if (direction === 'up') {
    character.classList.add('go-up')
    character.classList.remove('go-down')
  }

}


let numOfHoles = 0;
let soundCount = 0;


function handleCharacterCollisions() {
  const colisionBlock = detectColision(character, block)
  const colisionHole = detectColision(character, hole, {y1: -46, y2: 47})

  if (colisionBlock && !colisionHole) {
    changeScoreUi()
    return gameOver()
  }

  else if (colisionHole) {
    scoreTotal++

    soundCount++

    if (soundCount > 35) {
      (new Audio('/audio/hole.wav')).play()
      soundCount = 0
    }

    changeScoreUi()

    if (gameStopped) return

    numOfHoles++

    if (numOfHoles > 150) {
      numOfHoles = 0

      //star handling

    }
  }
}



function handleCharacterPosition(diff){
  const characterTop = parseInt(getCssProp(character, 'top'))
  const changeTop = characterTop + diff


  if (changeTop < 0)
    return
  if (changeTop > window.innerHeight) {
    return gameOver()
  }
  character.style.top = `${changeTop}px`

}



function InitRandomHoles() {
  hole.addEventListener('animationiteration', _ => {
    const fromHeight = 60 * window.innerHeight / 100
    const toHeight = 95 * window.innerHeight / 100

    const randomTop = getRandomNumber ( fromHeight, toHeight)
    hole.style.top = `-${randomTop}px`
  })
}


function beginGravity() {
  setInterval(_ => {
    if (isJumping || gameStopped) return
    changeGameState({diff: 5, direction: 'down'})
  }, 20)
  
}

function startGravity(){
  gravityStopped = false
}

function stopGravity() {
  gravityStopped = true
}

function startBgAnimation() {
  game.style.animation = 'backgroundAnimation 5s infinite linear'
}

function stopBgAnimation() {
  game.style.animation = ''
}


function showGameoverscreen() {
  gameoverscreen.style.display = 'block'
}

function hideGameoverscreen() {
  gameoverscreen.style.display = 'none'
}


function showStar() {
  if (star.style.display === 'none') {
    star.style.display = 'block'
  }

  star.style.top = `${getRandomNumber(20, 70)}%`
  //star.style.left = `${getRandomNumber(19,20)}%`
  const seconds = roundNum(window.innerWidth / gamespeedConfig[gameSpeed])
  const num = getRandomNumber(1 ,5 )

  const starAnimationcss = `starAnimation${num} ${seconds}s infinite linear`
  star.style.animation = starAnimationcss

  setTimeout(_ => hideStar(), 5000)
  setTimeout(_ => showStar(), 5000)
  

  
}

function hideStar() {
  star.style.display = 'none'
}

//setTimeout(_ => hideStar(), 150)
//mycode




function gameInit() {
  getElements()
  setInitialValues()
  showStar()
  handleStarDetection()
  beginGravity()
  InitRandomHoles()
  setEventListeners()
  resetAllAnimations()
  startBgAnimation()
}

gameInit()
