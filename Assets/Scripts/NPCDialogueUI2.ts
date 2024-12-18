import { GameObject, TextAsset, Collider, Resources, Sprite, Vector2, WaitForSeconds, AudioSource, AudioClip, PlayerPrefs } from 'UnityEngine';
import { Button, Image } from 'UnityEngine.UI';
import { TMP_Text } from 'TMPro';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { ZepetoCharacter, ZepetoPlayers } from "ZEPETO.Character.Controller";

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

export default class DialogueManager2 extends ZepetoScriptBehaviour {
    public dialogueCanvas: GameObject;
    public nameText: TMP_Text;
    public dialogueText: TMP_Text;
    public choiceButtons: Button[];
    public imageButtons: Button[];
    public nextButton: Button;
    public exitButton: Button;
    public hintButton: Button; // ��Ʈ ��ư �߰�
    public hintExitButton: Button; // ��Ʈ â�� Exit ��ư �߰�
    public hintUI: GameObject; // ��Ʈ UI ������Ʈ �߰�
    public uiImages: GameObject[];
    public audioSource: AudioSource; // ����� ����� ���� AudioSource �߰�
    public falseChoiceClip: AudioClip; // false ���� �� ����� mp3 Ŭ�� �߰�
    public trueChoiceClip: AudioClip; // true ���� �� ����� mp3 Ŭ�� �߰�

    private _specialDialogue: Dialogue | null = null;
    private _dialogues: Dialogue[] = [];
    private _currentDialogueIndex: number = 0;
    private _isInCollider: boolean = false;
    private _zepetoCharacter: ZepetoCharacter;
    private _falseChoiceCount: number = 0;

    private savedResults: { dialogueId: number; attempts: number; correctAnswer: string }[] = [];

    Start() {
        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
            this._zepetoCharacter = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
        });

        const jsonFile: TextAsset = Resources.Load<TextAsset>("dialogues2");
        if (jsonFile) {
            const data = JSON.parse(jsonFile.text);
            this._dialogues = data.dialogues.filter((d: Dialogue) => d.id !== 31);
            this._specialDialogue = data.dialogues.find((d: Dialogue) => d.id === 31);
        } else {
            console.error("Failed to load JSON file.");
            return;
        }

        this.HideUI();
        this.HideHint(); // ��Ʈ UI�� ���� �� ����
        this.nextButton.onClick.AddListener(() => this.OnNext());
        this.exitButton.onClick.AddListener(() => this.OnExit());
        this.hintButton.onClick.AddListener(() => this.ShowHint()); // ��Ʈ ��ư �̺�Ʈ �߰�
        this.hintExitButton.onClick.AddListener(() => this.HideHint()); // ��Ʈ â�� Exit ��ư �̺�Ʈ �߰�

        for (let i = 0; i < this.choiceButtons.length; i++) {
            const buttonIndex = i;
            this.choiceButtons[i].onClick.AddListener(() => this.OnChoiceSelected(buttonIndex));
        }

        for (let i = 0; i < this.imageButtons.length; i++) {
            const buttonIndex = i;
            this.imageButtons[i].onClick.AddListener(() => this.OnChoiceSelected(buttonIndex));
        }

        this.HideAllUIImages();

        // ���� ����� �����͸� �ε�
        this.LoadResults();
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
        this.HideHint(); // UI�� ���� �� ��Ʈ�� ����
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
            this.SaveResult(currentDialogue.id, this._falseChoiceCount + 1, selectedOption.value);
            this.PlayTrueChoiceSound(); // true ���� �� ���� ���
            this._currentDialogueIndex++;
            this._falseChoiceCount = 0;
            this.UpdateDialogue();
        } else {
            this._falseChoiceCount++;
            this.PlayFalseChoiceSound(); // false ���� �� ���� ���
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

        // ���� ������ �ε� �� ��� �߰�
        const existingData = PlayerPrefs.GetString("DialogueResults", "[]");
        let resultsArray: { dialogueId: number; attempts: number; correctAnswer: string }[] = [];

        try {
            resultsArray = JSON.parse(existingData);
        } catch (error) {
            console.error("Failed to parse existing PlayerPrefs data:", error);
        }

        resultsArray.push(result);

        // ������ ����
        const savedData = JSON.stringify(resultsArray);
        PlayerPrefs.SetString("DialogueResults", savedData);
        PlayerPrefs.Save();

        console.log("Result saved:", JSON.stringify(result, null, 2));
        console.log("All results:", JSON.stringify(resultsArray, null, 2));
    }

    private LoadResults() {
        const savedData = PlayerPrefs.GetString("DialogueResults", "[]");
        try {
            this.savedResults = JSON.parse(savedData);
            console.log("Loaded Results:", JSON.stringify(this.savedResults, null, 2));
        } catch (error) {
            console.error("Failed to load results from PlayerPrefs:", error);
            this.savedResults = []; // �⺻������ �ʱ�ȭ
        }
    }


    private OnNext() {
        this._currentDialogueIndex++;
        this._falseChoiceCount = 0;
        this.UpdateDialogue();
    }

    private OnExit() {
        console.log("Dialogue exited by user.");
        this._currentDialogueIndex = 0;
        this._falseChoiceCount = 0;
        this.HideUI();
    }

    private ShowHint() {
        if (this.hintUI) {
            this.hintUI.SetActive(true);
        }
    }

    private HideHint() {
        if (this.hintUI) {
            this.hintUI.SetActive(false);
        }
    }

    private ShowUIImage(index: number) {
        if (index >= 0 && index < this.uiImages.length) {
            this.uiImages[index].SetActive(true);
            this.StartCoroutine(this.HideUIImageAfterDelay(this.uiImages[index], 1));
        }
    }

    private *HideUIImageAfterDelay(image: GameObject, delay: number) {
        yield new WaitForSeconds(delay);
        image.SetActive(false);
    }

    private HideAllUIImages() {
        for (const image of this.uiImages) {
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
