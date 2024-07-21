let game;

const gameOptions = {
  dudeGravity: 800,
  dudeSpeed: 300,
};

window.onload = function () {
  let gameConfig = {
    type: Phaser.AUTO,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 800,
      height: 1000,
    },
    pixelArt: true,
    physics: {
      default: "arcade",
      arcade: {
        gravity: {
          y: 0,
        },
      },
    },
    scene: PlayGame,
  };

  game = new Phaser.Game(gameConfig);
  window.focus();
};

class PlayGame extends Phaser.Scene {
  constructor() {
    super("PlayGame");
    this.score = 0;
  }

  preload() {
    this.load.image("mushroom", "assets/mushroom.png");
    this.load.image("ground", "assets/plat.png");
    this.load.image("background", "assets/ground.jpeg");
    this.load.image("star", "assets/star.png");
    this.load.image("pinkstar", "assets/pinkstar.png");
    this.load.image("bomb", "assets/bomb.png");
    this.load.spritesheet("dude", "assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  create() {
    this.background = this.add
      .image(0, 0, "background")
      .setOrigin(0, 0)
      .setDisplaySize(game.config.width, game.config.height);

    this.ground = this.physics.add.staticSprite(
      game.config.width / 2,
      game.config.height - 200,
      "ground"
    );
    this.ground.setSize(1600, 50);
    this.ground.setOrigin(0.5, 0.5);
    this.ground.setImmovable(true);

    this.dude = this.physics.add.sprite(
      game.config.width / 2,
      game.config.height / 2,
      "dude"
    );
    this.dude.body.gravity.y = gameOptions.dudeGravity;
    this.dude.setCollideWorldBounds(true);

    this.physics.add.collider(this.dude, this.ground);

    this.starsGroup = this.physics.add.group({});
    this.pinkstarsGroup = this.physics.add.group({});
    this.mushroomGroup = this.physics.add.group();
    this.bombGroup = this.physics.add.group();

    this.physics.add.overlap(
      this.dude,
      this.starsGroup,
      this.collectStar,
      null,
      this
    );
    this.physics.add.overlap(
      this.dude,
      this.pinkstarsGroup,
      this.collectPinkStar,
      null,
      this
    );
    this.physics.add.overlap(
      this.dude,
      this.mushroomGroup,
      this.collectMushroom,
      null,
      this
    );
    this.physics.add.overlap(
      this.dude,
      this.bombGroup,
      this.bombExplode,
      null,
      this
    );

    this.scoreText = this.add.text(32, 3, "0", {
      fontSize: "30px",
      fill: "#ffffff",
    });

    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceBar = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 4 }],
      frameRate: 10,
    });
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 9 }),
      frameRate: 10,
      repeat: -1,
    });

    this.fallingObjectsTimer = this.time.addEvent({
      callback: this.addFallingObjects,
      callbackScope: this,
      delay: 700,
      loop: true,
    });

    this.mushroomTimer = this.time.addEvent({
      callback: this.addMushroom,
      callbackScope: this,
      delay: 10000,
      loop: true,
    });

    this.bombTimer = this.time.addEvent({
      callback: this.bombFall,
      callbackScope: this,
      delay: 7500,
      loop: true,
    });
  }

  addFallingObjects() {
    if (Phaser.Math.Between(0, 1)) {
      this.starsGroup
        .create(Phaser.Math.Between(0, game.config.width), 0, "star")
        .setVelocityY(200);
    }

    if (Phaser.Math.Between(0, 3) === 0) {
      this.pinkstarsGroup
        .create(Phaser.Math.Between(0, game.config.width), 0, "pinkstar")
        .setVelocityY(200);
    }
  }

  addMushroom() {
    this.mushroomGroup
      .create(Phaser.Math.Between(0, game.config.width), 0, "mushroom")
      .setVelocityY(200);
  }

  bombFall() {
    this.bombGroup
      .create(Phaser.Math.Between(0, game.config.width), 0, "bomb")
      .setVelocityY(450);
  }

  collectStar(dude, star) {
    star.disableBody(true, true);
    this.score += 1;
    this.scoreText.setText(this.score);
  }

  collectPinkStar(dude, pinkstar) {
    pinkstar.disableBody(true, true);
    this.score += 5;
    this.scoreText.setText(this.score);
  }

  collectMushroom(dude, mushroom) {
    mushroom.disableBody(true, true);
    gameOptions.dudeSpeed = 600;

    this.time.addEvent({
      delay: 5000,
      callback: () => {
        gameOptions.dudeSpeed = 300;
      },
      callbackScope: this,
    });
  }

  bombExplode(dude, bomb) {
    bomb.disableBody(true, true);
    this.scene.restart();
  }

  update() {
    if (this.cursors.left.isDown) {
      this.dude.body.velocity.x = -gameOptions.dudeSpeed;
      this.dude.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.dude.body.velocity.x = gameOptions.dudeSpeed;
      this.dude.anims.play("right", true);
    } else {
      this.dude.body.velocity.x = 0;
      this.dude.anims.play("turn", true);
    }

    if (this.cursors.up.isDown && this.dude.body.touching.down) {
      this.dude.body.velocity.y = -gameOptions.dudeGravity / 1.6;
    }

    if (this.spaceBar.isDown) {
      this.scene.restart();
    }
  }
}
