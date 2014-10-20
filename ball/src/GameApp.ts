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

///<reference path="../libs/egret.d.ts"/>
///<reference path="LoadingUI.ts"/>

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
        RES.loadConfig("resources/resource.json", "resources/");
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

    private textContainer:egret.Sprite;
    private spriteContainer:egret.Sprite;
    private ballNumTxt:egret.TextField;

    /**
     * 创建游戏场景
     */
    private createGameScene():void {
        this.spriteContainer = new egret.Sprite();
        this.addChild(this.spriteContainer);

        this.textContainer = new egret.Sprite();
        this.addChild(this.textContainer);

        egret.Profiler.getInstance().run();

        var stage:egret.Stage = egret.MainContext.instance.stage;
        stage.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onTouchBegin, this);
        stage.addEventListener(egret.TouchEvent.TOUCH_END, this.onTouchEnd, this);
        stage.addEventListener(egret.Event.LEAVE_STAGE, this.onTouchEnd, this);
        stage.addEventListener(egret.Event.ENTER_FRAME, this.onEnterFrame, this);

        var txt:egret.TextField = new egret.TextField();
        txt.width = stage.stageWidth;
        txt.textAlign = egret.HorizontalAlign.CENTER;
        txt.text = "任意点击，添加Bitmap!";
        txt.textColor = 0xff0000;
        txt.y = 300;
        this.textContainer.addChild(txt);

        this.ballNumTxt = new egret.TextField();
        this.ballNumTxt.width = stage.stageWidth;
        this.ballNumTxt.textAlign = egret.HorizontalAlign.CENTER;
        this.ballNumTxt.y = 330;
        this.ballNumTxt.textColor = 0xff0000;
        this.textContainer.addChild(this.ballNumTxt);

        var txt:egret.TextField = new egret.TextField();
        txt.textColor = 0xff0000;
        txt.textAlign = egret.HorizontalAlign.CENTER;
        txt.width = egret.MainContext.instance.stage.stageWidth;
        if (egret.MainContext.instance.rendererContext instanceof egret.WebGLRenderer) {
            txt.text = "WebGLMode";
        }
        else {
            txt.text = "CanvasMode";
        }
        this.textContainer.addChild(txt);
    }

    private isTouching:boolean = false;

    private onTouchBegin(event:egret.TouchEvent):void {
        this.isTouching = true;
    }

    private onTouchEnd(event:egret.TouchEvent):void {
        this.isTouching = false;
    }

    private bitmapDataList:Array<any> = [];

    private onEnterFrame(event:egret.Event):void {
        var bitmap:egret.Bitmap;
        if (this.isTouching) {
            for (var j:number = 0; j < 3; j++) {
                bitmap = this.createBitmapByName("ball");
                this.spriteContainer.addChild(bitmap);
                this.bitmapDataList.push({display: bitmap, vx: Math.random() * 3, vy: Math.random() * 3});
                this.ballNumTxt.text = "当前" + this.bitmapDataList.length + "个Bitmap";
            }
        }

        var stage:egret.Stage = egret.MainContext.instance.stage;
        var stageWidth = stage.stageWidth;
        var stageHeight = stage.stageHeight;

        var l:number = this.bitmapDataList.length;
        for (var i:number = 0; i < l; i++) {
            var bitmapData = this.bitmapDataList[i];
            bitmap = bitmapData.display;
            var worldTransForm = bitmap._worldTransform;
            worldTransForm.tx += bitmapData.vx;
            worldTransForm.ty += bitmapData.vy;
            bitmap._x += bitmapData.vx;
            bitmap._y += bitmapData.vy;
            if (bitmap._x < 0 || bitmap._x > stageWidth - 20) {
                bitmapData.vx = -bitmapData.vx;
            }
            if (bitmap._y < 0 || bitmap._y > stageHeight - 20) {
                bitmapData.vy = -bitmapData.vy;
            }
        }
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