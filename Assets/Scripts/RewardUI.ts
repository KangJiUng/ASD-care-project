import { GameObject, Transform, Collider, PlayerPrefs, KeyCode, Input } from 'UnityEngine';
import { TMP_InputField, TMP_Text } from 'TMPro';
import { Button } from 'UnityEngine.UI';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { ZepetoCharacter, ZepetoPlayers } from "ZEPETO.Character.Controller";
import CoinManager from './CoinManager';
interface Reward {
    id: number;
    name: string;
    coinCost?: number;
}

export default class CitySignsDisplayUI extends ZepetoScriptBehaviour {
    public citySignsCanvas: GameObject;
    public parentModeButton: Button;
    public userModeButton: Button;
    public escButton: Button; // 기존 ESC 버튼
    public modeSelectEscButton: Button; // 모드 선택 모달 ESC 버튼 추가
    public parentHomeButton: Button;
    public userHomeButton: Button;
    public parentModePanel: GameObject;
    public userModePanel: GameObject;

    public rewardNameInput: TMP_InputField;
    public coinCostInput: TMP_InputField;
    public addRewardButton: Button;
    public deleteRewardButton: Button;
    public parentScrollViewText: TMP_Text;
    public userScrollViewText: TMP_Text;
    public rewardIdInput: TMP_InputField;
    public unlockButton: Button;
    public unlockModal: GameObject;
    public unlockModalText: TMP_Text;
    public closeModalButton: Button;

    private _isInCollider: boolean = false;
    private _zepetoCharacter: ZepetoCharacter;
    private rewards: Reward[] = [];
    private rewardIdCounter: number = 1;
    private _keyboardDisabled: boolean = false;

    Start() {
        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
            this._zepetoCharacter = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
        });

        this.citySignsCanvas.SetActive(false);
        this.parentModePanel.SetActive(false);
        this.userModePanel.SetActive(false);
        this.unlockModal.SetActive(false);

        this.parentModeButton.onClick.AddListener(() => this.SwitchToParentMode());
        this.userModeButton.onClick.AddListener(() => this.SwitchToUserMode());
        this.addRewardButton.onClick.AddListener(() => this.AddReward());
        this.deleteRewardButton.onClick.AddListener(() => this.DeleteReward());
        this.escButton.onClick.AddListener(() => {
            this.HideUI();
            this.EnableKeyboardControls(); // ESC로 닫을 때 키보드 활성화
            this.ResetInputs();
        });
        this.modeSelectEscButton.onClick.AddListener(() => {
            this.HideModeSelectModal(); // 모드 선택 ESC 버튼 로직
        });
        this.parentHomeButton.onClick.AddListener(() => {
            this.ReturnToModeSelection();
            this.EnableKeyboardControls();
        });
        this.userHomeButton.onClick.AddListener(() => {
            this.ReturnToModeSelection();
            this.ResetInputs();
        });
        this.unlockButton.onClick.AddListener(() => {
            this.UnlockReward();
            this.ResetInputs();
        });
        this.closeModalButton.onClick.AddListener(() => this.CloseUnlockModal());

        this.LoadRewards();
    }

    private OnTriggerEnter(collider: Collider) {
        if (this._zepetoCharacter && collider.gameObject === this._zepetoCharacter.gameObject) {
            this._isInCollider = true;
            this.ShowUI();
            this.DisableKeyboardControls(); // 모달 창이 뜰 때 키보드 비활성화
        }
    }

    private OnTriggerExit(collider: Collider) {
        if (this._zepetoCharacter && collider.gameObject === this._zepetoCharacter.gameObject) {
            this._isInCollider = false;
            this.HideUI();
            this.EnableKeyboardControls(); // Collider 밖으로 나가면 키보드 활성화
        }
    }

    private ShowUI() {
        if (!this._isInCollider) return;
        this.citySignsCanvas.SetActive(true);
        console.log("City signs canvas is now visible.");
    }

    private HideUI() {
        this.citySignsCanvas.SetActive(false);
        console.log("City signs canvas is now hidden.");
    }

    private HideModeSelectModal() {
        this.citySignsCanvas.SetActive(false);
        console.log("Mode selection modal hidden.");
    }

    private SwitchToParentMode() {
        this.parentModePanel.SetActive(true);
        this.userModePanel.SetActive(false);
        this.PopulateParentRewardList();
    }

    private SwitchToUserMode() {
        this.userModePanel.SetActive(true);
        this.parentModePanel.SetActive(false);
        this.PopulateUserRewardList();
    }

    private AddReward() {
        const name = this.rewardNameInput.text;
        const coinCostText = this.coinCostInput.text;

        if (!name) {
            console.log("Reward name is empty.");
            return;
        }

        let coinCost = 0;
        if (coinCostText && !isNaN(parseInt(coinCostText))) {
            coinCost = parseInt(coinCostText);
        }

        const newReward: Reward = { id: this.rewardIdCounter++, name, coinCost };
        this.rewards.push(newReward);

        this.rewardNameInput.text = "";
        this.coinCostInput.text = "";

        this.SaveRewards();
        this.PopulateParentRewardList();
    }

    private DeleteReward() {
        const nameInput = this.rewardNameInput.text.trim();
        const coinCostInput = this.coinCostInput.text.trim();

        if (!nameInput || !coinCostInput || isNaN(parseInt(coinCostInput))) {
            console.log("Invalid reward name or coin cost.");
            this.parentScrollViewText.text = "Invalid input. Please try again.";
            return;
        }

        const coinCost = parseInt(coinCostInput);

        // 일치하는 보상을 모두 찾은 뒤 ID 기준으로 내림차순 정렬
        const matchingRewards = this.rewards
            .filter((reward) =>
                reward.name.toLowerCase() === nameInput.toLowerCase() &&
                reward.coinCost === coinCost
            )
            .sort((a, b) => b.id - a.id); // ID 내림차순 정렬

        if (matchingRewards.length > 0) {
            const rewardToDelete = matchingRewards[0]; // 가장 큰 ID 값을 가진 보상
            const rewardIndex = this.rewards.findIndex((reward) => reward.id === rewardToDelete.id);

            if (rewardIndex !== -1) {
                const deletedReward = this.rewards.splice(rewardIndex, 1)[0];
                console.log(`Deleted reward: ${JSON.stringify(deletedReward)}`);
                this.PopulateParentRewardList();
                this.SaveRewards();
            } else {
                console.log("Error: Matching reward was not found in the main list.");
            }
        } else {
            console.log("No matching reward found to delete.");
            this.parentScrollViewText.text = "No matching reward found. Please try again.";
        }
    }

    private PopulateParentRewardList() {
        if (this.rewards.length === 0) {
            this.parentScrollViewText.text = "No rewards available.";
            return;
        }

        const rewardText = this.rewards
            .map((reward) => {
                const coinCost = reward.coinCost ?? 0;
                return `• "${reward.name}" - ${coinCost} Coins`;
            })
            .join("\n");

        this.parentScrollViewText.text = rewardText;
        console.log("Parent Reward List Updated:\n", rewardText);
    }

    private PopulateUserRewardList() {
        if (this.rewards.length === 0) {
            this.userScrollViewText.text = "No rewards available.";
            return;
        }

        const rewardText = this.rewards
            .map((reward) => {
                const coinCost = reward.coinCost ?? 0;
                return `${reward.id}. "${reward.name}" - ${coinCost} Coins`;
            })
            .join("\n");

        this.userScrollViewText.text = rewardText;
        console.log("User Reward List Updated:\n", rewardText);
    }

    private UnlockReward() {
        const inputIdText = this.rewardIdInput.text;

        if (!inputIdText || isNaN(parseInt(inputIdText))) {
            console.log("Invalid reward ID.");
            this.unlockModalText.text = "Invalid reward ID. Please enter a valid number.";
            this.unlockModal.SetActive(true);
            return;
        }

        const rewardId = parseInt(inputIdText);
        const reward = this.rewards.find(r => r.id === rewardId);

        if (reward) {
            // 보상 코스트가 설정되어 있을 경우 코인 차감
            if (reward.coinCost !== undefined && reward.coinCost > 0) {
                if (CoinManager.Instance.SubtractCoins(reward.coinCost)) {
                    console.log(`"${reward.name}" unlocked! Coins deducted: ${reward.coinCost}`);
                    this.unlockModalText.text = `"${reward.name}" has been unlocked!`;

                    // 저장된 코인 데이터를 업데이트
                    PlayerPrefs.SetInt("Coins", CoinManager.Instance.GetCoins());
                    PlayerPrefs.Save();
                    console.log("Coin data updated in PlayerPrefs.");
                } else {
                    console.log("Not enough coins to unlock the reward.");
                    this.unlockModalText.text = `Not enough coins to unlock "${reward.name}".`;
                }
            } else {
                console.log(`"${reward.name}" unlocked with no coin cost.`);
                this.unlockModalText.text = `"${reward.name}" has been unlocked!`;
            }
        } else {
            console.log(`Reward ID ${rewardId} not found.`);
            this.unlockModalText.text = `No reward found with ID ${rewardId}.`;
        }

        this.unlockModal.SetActive(true);
    }

    private CloseUnlockModal() {
        this.unlockModal.SetActive(false);
    }

    private ReturnToModeSelection() {
        this.parentModePanel.SetActive(false);
        this.userModePanel.SetActive(false);
        console.log("Returned to initial canvas");
    }

    private SaveRewards() {
        try {
            const rewardsJson = JSON.stringify(this.rewards);
            PlayerPrefs.SetString("Rewards", rewardsJson);
            PlayerPrefs.SetInt("RewardCounter", this.rewardIdCounter);
            PlayerPrefs.Save();
            console.log("Rewards saved successfully.");
        } catch (error) {
            console.error("Error saving rewards:", error);
        }
    }

    private LoadRewards() {
        try {
            const rewardsJson = PlayerPrefs.GetString("Rewards", "[]");
            this.rewards = JSON.parse(rewardsJson);

            this.rewards.forEach((reward, index) => {
                if (!reward.name || reward.coinCost === undefined) {
                    console.error(`Invalid reward at index ${index}:`, reward);
                }
            });

            this.rewardIdCounter = PlayerPrefs.GetInt("RewardCounter", 1);
            console.log("Rewards loaded successfully:", this.rewards);
        } catch (error) {
            console.error("Error loading rewards:", error);
        }
    }

    private ResetInputs() {
        this.rewardNameInput.text = "";
        this.coinCostInput.text = "";
        this.rewardIdInput.text = "";
        console.log("Inputs have been reset.");
    }

    private DisableKeyboardControls() {
        this._keyboardDisabled = true;
        console.log("Keyboard controls disabled.");
    }

    private EnableKeyboardControls() {
        this._keyboardDisabled = false;
        console.log("Keyboard controls enabled.");
    }

    Update() {
        if (this._keyboardDisabled) {
            Input.ResetInputAxes();
        }
    }
}

