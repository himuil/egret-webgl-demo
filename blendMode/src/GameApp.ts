/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

class GameApp extends egret.DisplayObjectContainer {

    /**
     * 加载进度界面
     */
    private loadingView:LoadingUI;

    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event:egret.Event) {
        //设置加载进度界面
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);

        //初始化Resource资源加载库
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/resource.json", "resource/");
    }

    /**
     * 配置文件加载完成,开始预加载preload资源组。
     */
    private onConfigComplete(event:RES.ResourceEvent):void {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.loadGroup("preload");
    }

    /**
     * preload资源组加载完成
     */
    private onResourceLoadComplete(event:RES.ResourceEvent):void {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            this.createGameScene();
        }
    }

    /**
     * preload资源组加载进度
     */
    private onResourceProgress(event:RES.ResourceEvent):void {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    }

    private laserList:Array<egret.Bitmap>;

    /**
     * 创建游戏场景
     */
    private createGameScene():void {
        var modeTxt:egret.TextField = new egret.TextField();
        modeTxt.textColor = 0xff0000;
        modeTxt.textAlign = egret.HorizontalAlign.CENTER;
        modeTxt.width = egret.MainContext.instance.stage.stageWidth;
        if (egret.MainContext.instance.rendererContext instanceof egret.WebGLRenderer) {
            modeTxt.text = "WebGLMode";
        }
        else {
            modeTxt.text = "CanvasMode";
        }
        this.stage.addChild(modeTxt);

        this.laserList = [];
        this.p1 = new egret.Point();
        this.p2 = new egret.Point();
        this.tick = 0;
        this.speed = 80;
        this.gameWidth = 480;
        this.gameHeight = 800;

        var bg:egret.Bitmap = this.createBitmapByName("laserBG");
        bg.width = this.gameWidth;
        bg.height = this.gameHeight;
        this.addChild(bg);

//        var l = this.createBitmapByName("laser1");
//        l.blendMode = "add";
//        l.scaleY = 2;
//        this.addChild(l);

        this.addEventListener(egret.Event.ENTER_FRAME, this.onEnterFrame, this);
    }

    private tick:number;
    private speed:number;
    private p1:egret.Point;
    private p2:egret.Point;
    private gameWidth:number;
    private gameHeight:number;

    private onEnterFrame(event:egret.Event):void {
        this.tick++;

        if (this.speed > 2) {
            if (this.tick >= this.speed) {
                this.addLaser(Math.random() > 0.5 ? 0 : 1);
                this.speed *= 0.9;
                this.tick = 0;
            }
        }
        else if (this.tick % 2 == 0) {
            this.addLaser(1);
        }
        else {
            this.addLaser(0);
        }
    }

    private addLaser(type:number):void {
        var laser:egret.Bitmap = this.getLaser(Math.floor(Math.random() * 5) + 1);
        if (type == 0) {
            this.p1.x = -20;
            this.p1.y = Math.random() * this.gameHeight;
            this.p2.x = this.gameWidth + 20;
            this.p2.y = Math.random() * this.gameHeight;
        }
        else {
            this.p1.x = Math.random() * this.gameWidth;
            this.p1.y = -20;
            this.p2.x = Math.random() * this.gameWidth;
            this.p2.y = this.gameHeight + 20;
        }
        laser.width = egret.Point.distance(this.p1, this.p2);
        laser.x = this.p1.x;
        laser.y = this.p1.y;
        var range:number = Math.atan2(this.p2.y - this.p1.y, this.p2.x - this.p1.x);
        laser.rotation = range * 180 / Math.PI;
        this.addChild(laser);
        laser.alpha = 1;
        laser.anchorY = 0.5;
        laser.scaleY = 1 + Math.random();
        egret.Tween.get(laser).wait(200).to({alpha: 0.2, scaleY: 0.2}, 300).call(function (laser) {
            this.removeChild(laser);
            this.laserList.push(laser);
        }, this, [laser]);
    }

    private getLaser(id:number):egret.Bitmap {
        var texture = RES.getRes("laser" + id);
        var laser:egret.Bitmap;
        if (this.laserList.length) {
            laser = this.laserList.pop();
        }
        else {
            laser = new egret.Bitmap();
        }
        laser.texture = texture;
        laser.blendMode = egret.BlendMode.ADD;
        return laser;
    }

    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     */
    private createBitmapByName(name:string):egret.Bitmap {
        var result:egret.Bitmap = new egret.Bitmap();
        var texture:egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }
}


