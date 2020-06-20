(function () {
	'use strict';

	var REG = Laya.ClassUtils.regClass;
	var ui;
	(function (ui) {
	    var test;
	    (function (test) {
	        class TestSceneUI extends Laya.Scene {
	            constructor() { super(); }
	            createChildren() {
	                super.createChildren();
	                this.loadScene("test/TestScene");
	            }
	        }
	        test.TestSceneUI = TestSceneUI;
	        REG("ui.test.TestSceneUI", TestSceneUI);
	    })(test = ui.test || (ui.test = {}));
	})(ui || (ui = {}));

	class GameControl extends Laya.Script {
	    constructor() {
	        super(...arguments);
	        this.createBoxInterval = 1000;
	        this._time = 0;
	        this._started = false;
	        this.physicsWorldX = 0;
	        this.PhyObj = [];
	    }
	    onEnable() {
	        this._time = Date.now();
	        this._gameBox = this.owner.getChildByName("gameBox");
	    }
	    onUpdate() {
	        if (this.gameUI) {
	            let cardx = this.gameUI.car.x;
	            let xx = 640 - cardx;
	            let dif = xx - this.physicsWorldX;
	            if (dif) {
	                this.physicsWorldX = xx;
	                for (let one of this.PhyObj) {
	                    one.x += xx;
	                }
	            }
	        }
	    }
	    setGameUI(ui) {
	        this.gameUI = ui;
	        this.PhyObj.push(this.gameUI.car);
	        this.PhyObj.push(this.gameUI.wheel1);
	        this.PhyObj.push(this.gameUI.wheel2);
	        this.PhyObj.push(this.gameUI.line);
	    }
	    startGame() {
	        if (!this._started) {
	            this._started = true;
	            this.enabled = true;
	        }
	    }
	    stopGame() {
	        this._started = false;
	        this.enabled = false;
	        this.createBoxInterval = 1000;
	        this._gameBox.removeChildren();
	    }
	}

	class GameUI extends ui.test.TestSceneUI {
	    constructor() {
	        super();
	        GameUI.instance = this;
	        Laya.MouseManager.multiTouchEnabled = false;
	        window["car"] = this.car;
	        window["wheel1"] = this.wheel1;
	        window["wheel2"] = this.wheel2;
	        window["GameUI"] = this;
	    }
	    onEnable() {
	        this._control = this.getComponent(GameControl);
	        this._control.setGameUI(this);
	        this.BtnLeft.on(Laya.Event.MOUSE_UP, this, () => {
	            this.wheel2.getComponent(Laya.WheelJoint).enableMotor = false;
	            this.wheel1.getComponent(Laya.WheelJoint).enableMotor = false;
	        });
	        this.BtnLeft.on(Laya.Event.MOUSE_DOWN, this, () => {
	            this.wheel2.getComponent(Laya.WheelJoint).enableMotor = true;
	            this.wheel1.getComponent(Laya.WheelJoint).enableMotor = true;
	            this.wheel2.getComponent(Laya.WheelJoint).motorSpeed = -50;
	            this.wheel1.getComponent(Laya.WheelJoint).motorSpeed = -50;
	        });
	        this.BtnRight.on(Laya.Event.MOUSE_UP, this, () => {
	            this.wheel2.getComponent(Laya.WheelJoint).enableMotor = false;
	            this.wheel1.getComponent(Laya.WheelJoint).enableMotor = false;
	        });
	        this.BtnRight.on(Laya.Event.MOUSE_DOWN, this, () => {
	            this.wheel2.getComponent(Laya.WheelJoint).enableMotor = true;
	            this.wheel1.getComponent(Laya.WheelJoint).enableMotor = true;
	            this.wheel2.getComponent(Laya.WheelJoint).motorSpeed = 50;
	            this.wheel1.getComponent(Laya.WheelJoint).motorSpeed = 50;
	        });
	    }
	    onTipClick(e) {
	        this._score = 0;
	        this.scoreLbl.text = "";
	    }
	    addScore(value = 1) {
	        this._score += value;
	        this.scoreLbl.changeText("分数：" + this._score);
	        if (this._control.createBoxInterval > 600 && this._score % 20 == 0)
	            this._control.createBoxInterval -= 20;
	    }
	    stopGame() {
	        this._control.stopGame();
	    }
	}

	class Bullet extends Laya.Script {
	    constructor() { super(); }
	    onEnable() {
	        var rig = this.owner.getComponent(Laya.RigidBody);
	        rig.setVelocity({ x: 0, y: -10 });
	    }
	    onTriggerEnter(other, self, contact) {
	        this.owner.removeSelf();
	    }
	    onUpdate() {
	        if (this.owner.y < -10) {
	            this.owner.removeSelf();
	        }
	    }
	    onDisable() {
	        Laya.Pool.recover("bullet", this.owner);
	    }
	}

	class DropBox extends Laya.Script {
	    constructor() {
	        super();
	        this.level = 1;
	    }
	    onEnable() {
	        this._rig = this.owner.getComponent(Laya.RigidBody);
	        this.level = Math.round(Math.random() * 5) + 1;
	        this._text = this.owner.getChildByName("levelTxt");
	        this._text.text = this.level + "";
	    }
	    onUpdate() {
	        this.owner.rotation++;
	    }
	    onTriggerEnter(other, self, contact) {
	        var owner = this.owner;
	        if (other.label === "buttle") {
	            if (this.level > 1) {
	                this.level--;
	                this._text.changeText(this.level + "");
	                owner.getComponent(Laya.RigidBody).setVelocity({ x: 0, y: -10 });
	                Laya.SoundManager.playSound("sound/hit.wav");
	            }
	            else {
	                if (owner.parent) {
	                    let effect = Laya.Pool.getItemByCreateFun("effect", this.createEffect, this);
	                    effect.pos(owner.x, owner.y);
	                    owner.parent.addChild(effect);
	                    effect.play(0, true);
	                    owner.removeSelf();
	                    Laya.SoundManager.playSound("sound/destroy.wav");
	                }
	            }
	            GameUI.instance.addScore(1);
	        }
	        else if (other.label === "ground") {
	            owner.removeSelf();
	            GameUI.instance.stopGame();
	        }
	    }
	    createEffect() {
	        let ani = new Laya.Animation();
	        ani.loadAnimation("test/TestAni.ani");
	        ani.on(Laya.Event.COMPLETE, null, recover);
	        function recover() {
	            ani.removeSelf();
	            Laya.Pool.recover("effect", ani);
	        }
	        return ani;
	    }
	    onDisable() {
	        Laya.Pool.recover("dropBox", this.owner);
	    }
	}

	class GameConfig {
	    constructor() {
	    }
	    static init() {
	        var reg = Laya.ClassUtils.regClass;
	        reg("script/GameUI.ts", GameUI);
	        reg("script/GameControl.ts", GameControl);
	        reg("script/Bullet.ts", Bullet);
	        reg("script/DropBox.ts", DropBox);
	    }
	}
	GameConfig.width = 1280;
	GameConfig.height = 720;
	GameConfig.scaleMode = "fixedheight";
	GameConfig.screenMode = "horizontal";
	GameConfig.alignV = "top";
	GameConfig.alignH = "left";
	GameConfig.startScene = "test/TestScene.scene";
	GameConfig.sceneRoot = "";
	GameConfig.debug = false;
	GameConfig.stat = false;
	GameConfig.physicsDebug = true;
	GameConfig.exportSceneToJson = true;
	GameConfig.init();

	class Main {
	    constructor() {
	        if (window["Laya3D"])
	            Laya3D.init(GameConfig.width, GameConfig.height);
	        else
	            Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
	        Laya["Physics"] && Laya["Physics"].enable();
	        Laya["DebugPanel"] && Laya["DebugPanel"].enable();
	        Laya.stage.scaleMode = GameConfig.scaleMode;
	        Laya.stage.screenMode = GameConfig.screenMode;
	        Laya.stage.alignV = GameConfig.alignV;
	        Laya.stage.alignH = GameConfig.alignH;
	        Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
	        Laya.stage.screenMode = "horizontal";
	        if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true")
	            Laya.enableDebugPanel();
	        if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"])
	            Laya["PhysicsDebugDraw"].enable();
	        if (GameConfig.stat)
	            Laya.Stat.show();
	        Laya.alertGlobalError(true);
	        Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
	    }
	    onVersionLoaded() {
	        Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
	    }
	    onConfigLoaded() {
	        GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
	    }
	}
	new Main();

}());
//# sourceMappingURL=bundle.js.map
