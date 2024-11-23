import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {Button, Image, Shadow} from "UnityEngine.UI";
import {Canvas, GameObject, Transform, Sprite, Color} from "UnityEngine";
import { UnityEvent } from "UnityEngine.Events";
import {ZepetoText} from "ZEPETO.World.Gui";

export default class PopupController extends ZepetoScriptBehaviour {

    @Header("[Custom Properties]")
    // public title: string;
    @Tooltip("Graphic shown as background image, needs to be a Sprite type")
    public backgroundImage: Sprite;
    @Tooltip("String for the message shown above the button")
    public message: string;
    @Tooltip("Text color for the message")
    public messageColor: Color;
    @Tooltip("Enable/Disable shadow of the message text")
    public messageShadow: boolean;
    @Tooltip("Caption of the button")
    public buttonTitle: string;
    
    @Header("[Connections - do not edit]")
    @SerializeField() private _canvas: Canvas;
    @SerializeField() private _background: Image;
    @SerializeField() private _button: Button;
    @SerializeField() private _text: ZepetoText;
    // @HideInInspector() public OnClickEvent: UnityEvent;
    
    Start() {
        
        this._background.sprite = this.backgroundImage;
        
        this._text.text = this.message;
        this._text.color = this.messageColor;
        this._text.GetComponent<Shadow>().enabled = this.messageShadow;
        
        this._button.gameObject.GetComponentInChildren<ZepetoText>().text = this.buttonTitle;
        
        this._button.onClick.AddListener(()=>{
            this._canvas.gameObject.SetActive(false);
        });
    }

}
