class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
    }

    create() {

        // ============ BACKGROUND (FULL SCREEN) ============
        this.add.image(720, 512, "bg").setDisplaySize(1440, 1024);


        // ============ MAIN TITLE ============
        this.add.text(720, 60, "JUST DIVIDE", {
            font: "56px Arial",
            fontStyle: "bold",
            color: "#000"
        }).setOrigin(0.5);


        // ============ SUBTITLE ============
        this.add.text(720, 120,
            "DIVIDE WITH THE NUMBERS TO SOLVE THE ROWS AND COLUMNS.",
            {
                font: "30px Arial",
                fontStyle: "bold",
                color: "#b63636"
            }
        ).setOrigin(0.5);


        // ============ CAT HEAD IMAGE ============
        // (Your Cat.png is a bit large — correct scale)
        this.add.image(720, 250, "cat").setScale(0.85);


        // ============ LEVEL + SCORE PANEL ============

        // Position based on PDF layout
        this.add.image(720, 350, "levelScore").setScale(0.72);

        this.add.text(600, 330, "LEVEL 1", {
            font: "32px Arial",
            fontStyle: "bold",
            color: "#fff"
        });

        this.add.text(815, 330, "SCORE 40", {
            font: "32px Arial",
            fontStyle: "bold",
            color: "#fff"
        });


        // ============ GRID PANEL BACKGROUND ============
        this.add.image(720, 620, "gridPanel").setScale(1.0);


        // ============ 4×4 GRID SLOTS ============

        const gridStartX = 520;
        const gridStartY = 510;
        const cellSize = 130;

        this.gridSlots = [];

        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                let x = gridStartX + c * cellSize;
                let y = gridStartY + r * cellSize;

                let slot = this.add.rectangle(x, y, 110, 110, 0x007a92)
                    .setStrokeStyle(6, 0xffffff)
                    .setOrigin(0.5);

                this.gridSlots.push(slot);
            }
        }


        // ============ KEEP / UPCOMING / TRASH RIGHT PANEL ============

        // KEEP
        this.add.text(1080, 350, "KEEP", {
            font: "28px Arial",
            fontStyle: "bold",
            color: "#000"
        });

        this.add.image(1080, 410, "tileBlue").setScale(0.9);

        // UPCOMING
        this.add.text(1070, 510, "UPCOMING", {
            font: "26px Arial",
            fontStyle: "bold",
            color: "#000"
        });

        this.add.image(1080, 580, "tileRed").setScale(1.0);
        this.add.image(1080, 660, "tileOrange").setScale(0.9);
        this.add.image(1080, 740, "tilePurple").setScale(0.85);

        // TRASH
        this.add.text(1080, 830, "TRASH", {
            font: "32px Arial",
            fontStyle: "bold",
            color: "#000"
        });

        this.add.rectangle(1080, 900, 150, 120, 0xe22).setStrokeStyle(6, 0xffffff);

        this.add.text(1080, 900, "x10", {
            font: "40px Arial",
            fontStyle: "bold",
            color: "#fff"
        }).setOrigin(0.5);
    }
}
