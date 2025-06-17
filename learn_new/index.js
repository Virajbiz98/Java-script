


function gamasContainer() {
    console.log("🚗 Gama's Car")
    gamasContainer()
    console.log("🚗 Dilan's Car")
    console.log("🚗 Malith's Car")  


    for(let i = 0; i < 10; i++) {
        setTimeout( function johnsContainer() {
            console.log("🚗 john's Car" + i)
        }, 2000)    
    }

    
    mnushContainer()
    console.log("🚗 Winusha's Car")
}

function mnushContainer() {
    console.log("🚗 Manush's Car")
    console.log("🚗 Dilan's Car")
    console.log("🚗 Malith's Car")
}

function koticontainer() {
    console.log("🚗 santan's Car")
    throw new Error("blast");
}

gamasContainer()
// mnushContainer()
