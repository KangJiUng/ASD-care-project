import { ZepetoScriptBehaviour, ZepetoScriptableObject } from 'ZEPETO.Script';
import { KnowSockets, ZepetoCharacter, ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { Object, GameObject, Color } from 'UnityEngine';
import { Button, Text, Image } from 'UnityEngine.UI';
import { AudioMode, RoomProperty, VoiceChatController, VoiceType } from 'ZEPETO.Voice.Chat';
import VoiceModeScriptObjectDef from './VoiceModeScriptObjectDef';

export default class VoiceChatManager extends ZepetoScriptBehaviour {

    @Tooltip("Button to open the VoiceMode panel.")
    @SerializeField() private _openButton: Button;
    @Tooltip("Button to close the VoiceMode panel.")
    @SerializeField() private _closeButton: Button;
    @Tooltip("The VoiceMode panel.")
    @SerializeField() private _voicePanel: GameObject;
    @Tooltip("Enable the loop-back feature, which allows you to hear your own voice.")
    @SerializeField() private _enableLoopback: bool;
    @Tooltip("Add the desired voice modes in a list format. Original=0, Chipmunk=1, Uncle=2, Echo=3, DeepVoice=4, Robot=5, Dialect=6, Megaphone=7, Beast=8, Machine=9, StrongCurrent=10, Kid=11, Hedgehog=12 ")
    @SerializeField() private _voiceTypes: VoiceType[];
    @Tooltip("Connects to a ScriptableObject where VoiceMode data is stored.")
    @SerializeField() private _voiceModeData: ZepetoScriptableObject<VoiceModeScriptObjectDef>;
    @Tooltip("Assign the ScrollView where the VoiceMode buttons will be placed.")
    @SerializeField() private _scrollViewContent: GameObject;
    @Tooltip("Assign the VoiceMode button prefab template.")
    @SerializeField() private _buttonTemplate: GameObject;
    @Tooltip("GameObject variable to store the voice chat bubble prefab.")
    @SerializeField() private voiceChatPrefab: GameObject;
    @Tooltip("Map to store GameObjects associated with user IDs.")
    @SerializeField() _voiceBubbleMap: Map<string, GameObject> = new Map<string, GameObject>();


    private _myCharacter: ZepetoCharacter;

    Start() {
        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
            this._myCharacter = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
            this.setupVoicePanel();
            this.setupVoiceButtons();
        });

        // Method called when the Voice Chat system is initialized
        VoiceChatController.OnInitializedEvent.AddListener(
            init => {
                VoiceChatController.EnterRoom(new RoomProperty());
                this.OnInitialized(init);
            }
        );

        // Method called when the Voice Chat room is connected
        VoiceChatController.OnRoomConnectedEvent.AddListener(
            connected => {
                // Set the initial voice type and activate loopback
                VoiceChatController.SetVoiceType(this._voiceTypes[0]);
                VoiceChatController.EnableLoopback(this._enableLoopback);
                this.OnRoomConnected(connected);
            }
        );

        VoiceChatController.OnSpeechDetectedEvent.AddListener(
            (userId, speechDetected) => this.OnSpeechDetected(userId, speechDetected)
        );
    }

    // Set the voice panel UI
    private setupVoicePanel() {
        this._openButton.onClick.AddListener(() => {
            this._voicePanel.SetActive(true);
            var image = this._openButton.GetComponent<Image>();
            if (image != null) {
                image.color = new Color(1.0, 1.0, 0.0);
            }
        });
        this._closeButton.onClick.AddListener(() => {
            this._voicePanel.SetActive(false);
            var image = this._openButton.GetComponent<Image>();
            if (image != null) {
                image.color = new Color(1.0, 1.0, 1.0);
            }
        });
    }

    // Set the voice type and button prefab corresponding to the clicked button index
    private setupVoiceButtons() {
        this._voiceTypes.forEach((voiceType, index) => {
            const btn = Object.Instantiate(this._buttonTemplate, this._scrollViewContent.transform) as GameObject;
            const buttonComponent = btn.GetComponent<Button>();
            if (buttonComponent != null) {
                buttonComponent.onClick.AddListener(() => {
                    VoiceChatController.SetVoiceType(voiceType);
                });
            } else {
                console.log("Voice Button instantiation failed.");
            }

            const textComponent = btn.transform.Find("Text").GetComponent<Text>();
            if (textComponent != null) {
                textComponent.text = this._voiceModeData["description"][voiceType];
            }

            const imageComponent = btn.transform.Find("Image").GetComponent<Image>();
            if (imageComponent != null) {
                imageComponent.sprite = this._voiceModeData["img"][voiceType];
            }

        });

    }

    // Method to exit the Voice Chat room
    OnDestroy() {
        VoiceChatController.OnInitializedEvent.RemoveAllListeners();
        VoiceChatController.OnRoomConnectedEvent.RemoveAllListeners();
    }


    // Method about voiechat bubble.
    // Method called when the Voice Chat system is initialized
    private OnInitialized(initialized: boolean) {
        console.log("[VoiceChat] OnInitialized: ");
        this.EnterVoiceChatRoom(1);
    }
 
    // Method called when the Voice Chat room is connected
    private OnRoomConnected(connected: boolean) {
        console.log("[VoiceChat] OnRoomConnected: ");
    }
 
    // Method to enter a Voice Chat room based on the given team index
    private EnterVoiceChatRoom(teamIndex: number) {
        console.log("[VoiceChat] EnterVoiceChatRoom");
 
        // Create a new RoomProperty object and set its properties
        let roomProperty = new RoomProperty();
        roomProperty.SetAudioMode(AudioMode.Omnidirectional);
        VoiceChatController.EnterRoom(roomProperty);
    }
 
    // Method called when a user's speech is detected or not detected
    private OnSpeechDetected(userId: string, speechDetected: boolean) {
        console.log("[VoiceChat] OnSpeechDetected: " + userId + ", " + speechDetected);
 
        // // Check if the user ID is not in the voice bubble map and create a voice bubble if it is not
        // if (!this._voiceBubbleMap.has(userId)) {
        //     this.CreateVoiceBubble(userId);
        // }
 
        // this.SetVoiceBubble(userId, speechDetected);
    }
 
    // Method to set the active state of the voice bubble for a given user ID
    // private SetVoiceBubble(userId: string, speechDetected: boolean) {
    //     const chatBubble = this._voiceBubbleMap.get(userId);
    //     chatBubble.SetActive(speechDetected);
    // }
 
    // Method to create a voice bubble for a given user ID
    // private CreateVoiceBubble(userId: string) {
 
    //     // Get the head socket of the user's character
    //     const headSocket = ZepetoPlayers.instance.GetPlayerWithUserId(userId).character.GetSocket(KnowSockets.HEAD_UPPER);
 
    //     // Instantiate the voice chat bubble prefab at the head socket position
    //     const instanceBubble = Object.Instantiate(this.voiceChatPrefab, headSocket) as GameObject;
 
    //     // Add the instantiated bubble to the voice bubble map
    //     this._voiceBubbleMap.set(userId, instanceBubble);
    //     instanceBubble.SetActive(false);
    // }
 
    // LateUpdate() {

    //     // Check if the voice bubble map is empty and return if it is
    //     if (this._voiceBubbleMap.size === 0) {
    //         return;
    //     }

    //     // Iterate through the voice bubble map and update the rotation of each bubble GameObject
    //     this._voiceBubbleMap.forEach((bubbleObject: GameObject) => {
    //         // Set the rotation of the bubble object to match the camera's parent transform rotation
    //         bubbleObject.transform.rotation = ZepetoPlayers.instance.ZepetoCamera.cameraParent.transform.rotation;
    //     });

    // }

}