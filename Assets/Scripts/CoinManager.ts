import { PlayerPrefs } from 'UnityEngine';

export default class CoinManager {
    private static instance: CoinManager;
    private coins: number = 0;

    // 코인 변경 이벤트
    public OnCoinsChanged: (newCoins: number) => void = null;

    private constructor() {
        // PlayerPrefs에서 기존 코인 값 로드
        this.coins = PlayerPrefs.GetInt("Coins", 0);
    }

    public static get Instance(): CoinManager {
        if (!this.instance) {
            this.instance = new CoinManager();
        }
        return this.instance;
    }

    public GetCoins(): number {
        return this.coins;
    }

    public AddCoins(amount: number): void {
        this.coins += amount;
        this.SaveCoins();
        this.NotifyCoinsChanged(); // 변경 사항 알림
    }

    public SubtractCoins(amount: number): boolean {
        if (this.coins >= amount) {
            this.coins -= amount;
            this.SaveCoins();
            this.NotifyCoinsChanged(); // 변경 사항 알림
            return true; // 성공적으로 차감
        }
        return false; // 코인이 부족한 경우
    }

    private SaveCoins(): void {
        PlayerPrefs.SetInt("Coins", this.coins);
        PlayerPrefs.Save();
    }

    private NotifyCoinsChanged(): void {
        if (this.OnCoinsChanged) {
            this.OnCoinsChanged(this.coins); // 이벤트 호출
        }
    }
}
