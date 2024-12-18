import { GameObject, TextAsset, Collider, Resources, Sprite, Vector2, WaitForSeconds, AudioSource, AudioClip, PlayerPrefs } from 'UnityEngine';
import { Button, Image } from 'UnityEngine.UI';
import { TMP_Text } from 'TMPro';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { ZepetoCharacter, ZepetoPlayers } from "ZEPETO.Character.Controller";
import CoinManager from './CoinManager';

interface Option {
    type: string;
    value: string;
    required: boolean;
}

interface Dialogue {
    id: number;
    name: string | null;
    text: string;
    options: Option[] | null;
}

export default class DialogueManager3 extends ZepetoScriptBehaviour {
    public dialogueCanvas: GameObject;
    public finishModal: GameObject; // Finish 모달 창
    public finishButton: Button; // Finish 버튼
    public nameText: TMP_Text;
    public dialogueText: TMP_Text;
    public choiceButtons: Button[];
    public imageButtons: Button[];
    public nextButton: Button;
    public exitButton: Button; // 나가기 버튼
    public uiImages: GameObject[];
    public uiImagesForID10: GameObject[];
    public uiImagesForID13: GameObject[];
    public audioSource: AudioSource; // 오디오 재생을 위한 AudioSource 추가
    public falseChoiceClip: AudioClip; // false 선택 시 재생할 mp3 클립 추가
    public trueChoiceClip: AudioClip; // true 선택 시 재생할 mp3 클립 추가

    private _specialDialogue: Dialogue | null = null;
    private _dialogues: Dialogue[] = [];
    private _currentDialogueIndex: number = 0;
    private _isInCollider: boolean = false;
    private _zepetoCharacter: ZepetoCharacter;
    private _falseChoiceCount: number = 0;
    private _currentImageGroup: GameObject[] = [];

    Start() {
        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
            this._zepetoCharacter = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
        });

        const jsonFile: TextAsset = Resources.Load<TextAsset>("dialogues3");
        if (jsonFile) {
            const data = JSON.parse(jsonFile.text);
            this._dialogues = data.dialogues.filter((d: Dialogue) => d.id !== 31);
            this._specialDialogue = data.dialogues.find((d: Dialogue) => d.id === 31);
        } else {
            console.error("Failed to load JSON file.");
            return;
        }

        this.HideUI();
        this.finishModal.SetActive(false); // 초기 모달 비활성화
        this.nextButton.onClick.AddListener(() => this.OnNext());
        this.exitButton.onClick.AddListener(() => this.OnExit());

        for (let i = 0; i < this.choiceButtons.length; i++) {
            const buttonIndex = i;
            this.choiceButtons[i].onClick.AddListener(() => this.OnChoiceSelected(buttonIndex));
        }

        for (let i = 0; i < this.imageButtons.length; i++) {
            const buttonIndex = i;
            this.imageButtons[i].onClick.AddListener(() => this.OnChoiceSelected(buttonIndex));
        }

        this.finishButton.onClick.AddListener(() => this.OnFinishButtonClicked());
        this.HideAllImages(this.uiImages);
        this.HideAllImages(this.uiImagesForID10);
        this.HideAllImages(this.uiImagesForID13);
    }

    OnTriggerEnter(collider: Collider) {
        if (this._zepetoCharacter && collider.gameObject === this._zepetoCharacter.gameObject) {
            this._isInCollider = true;
            this.ShowUI();
        }
    }

    OnTriggerExit(collider: Collider) {
        if (this._zepetoCharacter && collider.gameObject === this._zepetoCharacter.gameObject) {
            this._isInCollider = false;
            this.HideUI();
        }
    }

    private ShowUI() {
        if (!this._isInCollider) return;
        this.UpdateDialogue();
        this.dialogueCanvas.SetActive(true);
    }

    private HideUI() {
        this.dialogueCanvas.SetActive(false);
        this.finishModal.SetActive(false);
    }

    private UpdateDialogue() {
        if (this._currentDialogueIndex >= this._dialogues.length) {
            this.HideUI();
            return;
        }

        const currentDialogue = this._dialogues[this._currentDialogueIndex];
        this.dialogueText.text = currentDialogue.text;

        if (currentDialogue.name) {
            this.nameText.text = currentDialogue.name;
            this.nameText.gameObject.SetActive(true);
        } else {
            this.nameText.gameObject.SetActive(false);
        }

        if (currentDialogue.id === 11) {
            this._currentImageGroup = this.uiImagesForID10;
        } else if (currentDialogue.id === 14) {
            this._currentImageGroup = this.uiImagesForID13;
        } else {
            this._currentImageGroup = this.uiImages;
        }

        if (currentDialogue.options && currentDialogue.options.length > 0) {
            const textOptions = currentDialogue.options.filter(opt => opt.type === "text");
            const imageOptions = currentDialogue.options.filter(opt => opt.type === "image");

            if (textOptions.length > 0) {
                this.ShowTextChoices(textOptions);
            }

            if (imageOptions.length > 0) {
                this.ShowImageChoices(imageOptions);
            }

            this.nextButton.gameObject.SetActive(false);
        } else {
            this.HideChoices();
            this.nextButton.gameObject.SetActive(true);
        }
    }

    private ShowTextChoices(choices: Option[]) {
        this.HideChoices();

        for (let i = 0; i < choices.length; i++) {
            if (i < this.choiceButtons.length) {
                const button = this.choiceButtons[i];
                button.gameObject.SetActive(true);
                const textComponent = button.GetComponentInChildren<TMP_Text>();
                if (textComponent) textComponent.text = choices[i].value;
            }
        }
    }

    private ShowImageChoices(choices: Option[]) {
        this.HideChoices();

        for (let i = 0; i < choices.length; i++) {
            if (i < this.imageButtons.length) {
                const button = this.imageButtons[i];
                button.gameObject.SetActive(true);

                const imageComponent = button.GetComponentInChildren<Image>();
                const sprite = Resources.Load<Sprite>(choices[i].value);

                if (sprite && imageComponent) {
                    imageComponent.sprite = sprite;
                    imageComponent.rectTransform.sizeDelta = new Vector2(50, 50);
                } else {
                    console.error(`Failed to load image: ${choices[i].value}`);
                }
            }
        }
    }

    private HideChoices() {
        for (const button of this.choiceButtons) {
            button.gameObject.SetActive(false);
        }

        for (const button of this.imageButtons) {
            button.gameObject.SetActive(false);
        }
    }

    private OnChoiceSelected(choiceIndex: number) {
        const currentDialogue = this._dialogues[this._currentDialogueIndex];
        if (!currentDialogue.options || choiceIndex >= currentDialogue.options.length) {
            console.error("Invalid choice index");
            return;
        }

        const selectedOption = currentDialogue.options[choiceIndex];
        if (selectedOption.required) {
            // Save result to PlayerPrefs
            this.SaveResult(currentDialogue.id, this._falseChoiceCount + 1, selectedOption.value);
            this.PlayTrueChoiceSound();
            this._currentDialogueIndex++;
            this._falseChoiceCount = 0;
            this.UpdateDialogue();
        } else {
            this._falseChoiceCount++;
            this.PlayFalseChoiceSound();
            if (this._specialDialogue) {
                this.dialogueText.text = this._specialDialogue.text;
            }

            this.ShowUIImage(this._falseChoiceCount - 1);

            if (this._falseChoiceCount >= 4) {
                this._currentDialogueIndex++;
                this._falseChoiceCount = 0;
                this.UpdateDialogue();
            }
        }
    }

    private SaveResult(dialogueId: number, attempts: number, correctAnswer: string) {
        const result = { dialogueId, attempts, correctAnswer };
        const existingData = PlayerPrefs.GetString("DialogueResults", "[]");
        let resultsArray: { dialogueId: number; attempts: number; correctAnswer: string }[] = [];

        try {
            resultsArray = JSON.parse(existingData);
        } catch (error) {
            console.error("Failed to parse existing PlayerPrefs data:", error);
        }

        resultsArray.push(result);
        const savedData = JSON.stringify(resultsArray);
        PlayerPrefs.SetString("DialogueResults", savedData);
        PlayerPrefs.Save();

        console.log("Result saved:", JSON.stringify(result, null, 2));
    }

    private OnNext() {
        this._currentDialogueIndex++;
        this._falseChoiceCount = 0;

        // 마지막 대화인 경우 Finish 모달 표시
        if (this._currentDialogueIndex >= this._dialogues.length) {
            this.ShowFinishModal();
        } else {
            this.UpdateDialogue();
        }
    }

    private ShowFinishModal() {
        this.dialogueCanvas.SetActive(false); // 대화 창 숨김
        this.finishModal.SetActive(true); // Finish 모달 표시
    }

    private OnFinishButtonClicked() {
        this.finishModal.SetActive(false); // 모달 창 닫기
        console.log("Finish 버튼 클릭됨 - 코인 지급 시작");

        // 코인 지급
        CoinManager.Instance.AddCoins(110); // 코인 10개 지급

        // 데이터를 저장
        CoinManager.Instance["SaveCoins"](); // SaveCoins 메서드 호출 (PlayerPrefs에 반영)
        console.log("코인 지급 및 데이터 저장 완료");
    }

    private OnExit() {
        console.log("Dialogue exited by user.");
        this._currentDialogueIndex = 0;
        this._falseChoiceCount = 0;
        this.HideUI();
    }

    private ShowUIImage(index: number) {
        if (this._currentImageGroup && index >= 0 && index < this._currentImageGroup.length) {
            const image = this._currentImageGroup[index];
            image.SetActive(true);
            this.StartCoroutine(this.HideUIImageAfterDelay(image, 1));
        }
    }

    private *HideUIImageAfterDelay(image: GameObject, delay: number) {
        yield new WaitForSeconds(delay);
        image.SetActive(false);
    }

    private HideAllImages(images: GameObject[]) {
        for (const image of images) {
            image.SetActive(false);
        }
    }

    private PlayFalseChoiceSound() {
        if (this.audioSource && this.falseChoiceClip) {
            this.audioSource.clip = this.falseChoiceClip;
            this.audioSource.Play();
        } else {
            console.error("AudioSource or AudioClip for false choice is missing.");
        }
    }

    private PlayTrueChoiceSound() {
        if (this.audioSource && this.trueChoiceClip) {
            this.audioSource.clip = this.trueChoiceClip;
            this.audioSource.Play();
        } else {
            console.error("AudioSource or AudioClip for true choice is missing.");
        }
    }
}
