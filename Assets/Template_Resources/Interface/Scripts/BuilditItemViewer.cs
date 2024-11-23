using UnityEngine;
using UnityEditor;
using System.Collections.Generic;
using System.Text.RegularExpressions;

public class BuilditItemViewer : EditorWindow
{
    private Dictionary<string, string> folderPaths = new Dictionary<string, string>()
    {
        { "All", null },
        { "Utility", "Assets/Template_Resources/Prefabs/Utility" },
        { "Cafe", "Assets/Template_Resources/Prefabs/ZepetoAssets_Cafe" },
        { "Cherry", "Assets/Template_Resources/Prefabs/ZepetoAssets_Cherryblossom" },
        { "City", "Assets/Template_Resources/Prefabs/ZepetoAssets_City" },
        { "Desert", "Assets/Template_Resources/Prefabs/ZepetoAssets_Desert" },
        { "Driving", "Assets/Template_Resources/Prefabs/ZepetoAssets_Driving" },
        { "Effect", "Assets/Template_Resources/Prefabs/ZepetoAssets_Effect" },
        { "Epic", "Assets/Template_Resources/Prefabs/ZepetoAssets_Epic_Village" },
        { "Galaxy", "Assets/Template_Resources/Prefabs/ZepetoAssets_Galaxy" },
        { "Korea", "Assets/Template_Resources/Prefabs/ZepetoAssets_Korea" },
        { "Middle", "Assets/Template_Resources/Prefabs/ZepetoAssets_Middle_Ages" },
        { "Mystery", "Assets/Template_Resources/Prefabs/ZepetoAssets_Mystery_House" },
        { "Party", "Assets/Template_Resources/Prefabs/ZepetoAssets_Party_Room" },
        { "Prison", "Assets/Template_Resources/Prefabs/ZepetoAssets_Prison" },
        { "School", "Assets/Template_Resources/Prefabs/ZepetoAssets_School" },
        { "Snow", "Assets/Template_Resources/Prefabs/ZepetoAssets_Snow_Village" },
        { "Subway", "Assets/Template_Resources/Prefabs/ZepetoAssets_Subway" },
        { "Sugar", "Assets/Template_Resources/Prefabs/ZepetoAssets_Sugarland" },
        { "Text", "Assets/Template_Resources/Prefabs/ZepetoAssets_Text" },
        { "Theme", "Assets/Template_Resources/Prefabs/ZepetoAssets_Themepark" },
        { "Wedding", "Assets/Template_Resources/Prefabs/ZepetoAssets_Wedding" }
    };
    private Dictionary<string, List<GameObject>> folderPrefabs = new Dictionary<string, List<GameObject>>();
    private Dictionary<string, Texture2D> prefabThumbnails = new Dictionary<string, Texture2D>();
    private Vector2 scrollPosition;
    private string selectedFolder = "Cafe";
    private GameObject selectedPrefab = null;
    private string cachedPopupLanguage;
    private string searchQuery = string.Empty;

    private float prefabIconSize = 80f;

    private Vector2 leftPanelScrollPosition;

    private GameObject parentObject = null;

    private Dictionary<string, string> selectPrefabPopup = new Dictionary<string, string>()
    {
        { "en", "A prefab is selected. The object will be created at the clicked location. \n To cancel, right-click or press ESC." },
        { "kr", "프리팹이 선택되어있습니다. 클릭되는 위치에 오브젝트가 생성됩니다. \n 취소는 마우스 우클릭 또는 ESC키를 눌러주세요." },
        { "ch", "已选择预制件。 对象将创建在单击位置。 \n 要取消，请右键单击或按 ESC。" },
        { "jp", "プレハブが選択されています。 オブジェクトはクリックされた場所に作成されます。 \n キャンセルするには、右クリックするか ESC キーを押します。" },
        { "in", "Prefab dipilih. Objek akan dibuat di lokasi yang diklik. \n Untuk membatalkan, klik kanan atau tekan ESC." },
        { "th", "เลือกพร็อพพรีเซ็ตแล้ว อ็อบเจ็กต์จะถูกสร้างที่ตำแหน่งที่คลิก \n เพื่อยกเลิก ให้คลิกขวาหรือกด ESC" },
        { "fr", "Un prefab est sélectionné. L'objet sera créé à l'emplacement cliqué. \n Pour annuler, cliquez avec le bouton droit ou appuyez sur ESC." }
    };

    [MenuItem("ZEPETO/Build It Asset Browser")]
    public static void ShowWindow()
    {
        GetWindow<BuilditItemViewer>("Build It Asset Browser");
    }

    private void OnEnable()
    {
        Debug.Log("OnEnable");
        SetObjectsParent();
        LoadAllPrefabs();
        LoadAllThumbnails();
        CacheSystemLanguage(); // 언어 캐시
        SceneView.duringSceneGui += OnSceneGUI;
    }

    private void OnDisable()
    {
        Debug.Log("OnDisable");
        SceneView.duringSceneGui -= OnSceneGUI;
    }

    private void CacheSystemLanguage()
    {
        switch (Application.systemLanguage)
        {
            case SystemLanguage.Korean:
                cachedPopupLanguage = selectPrefabPopup["kr"];
                break;
            case SystemLanguage.ChineseSimplified:
                cachedPopupLanguage = selectPrefabPopup["ch"];
                break;
            case SystemLanguage.Japanese:
                cachedPopupLanguage = selectPrefabPopup["jp"];
                break;
            case SystemLanguage.Indonesian:
                cachedPopupLanguage = selectPrefabPopup["in"];
                break;
            case SystemLanguage.Thai:
                cachedPopupLanguage = selectPrefabPopup["th"];
                break;
            case SystemLanguage.French:
                cachedPopupLanguage = selectPrefabPopup["fr"];
                break;
            default:
                cachedPopupLanguage = selectPrefabPopup["en"];
                break;
        }
    }

    private void SetObjectsParent()
    {
        if (parentObject == null)
        {
            parentObject = GameObject.Find("Objects");
        }
    }

    private void LoadAllPrefabs()
    {
        folderPrefabs.Clear();
        foreach (var folder in folderPaths)
        {
            LoadPrefabsInFolder(folder.Value, folder.Key);
        }
    }

    private void LoadAllThumbnails()
    {
        prefabThumbnails.Clear();
        string[] guids = AssetDatabase.FindAssets("t:Texture2D", new[] { "Assets/Template_Resources/Thumbnail" });
        foreach (string guid in guids)
        {
            string assetPath = AssetDatabase.GUIDToAssetPath(guid);
            Texture2D texture = AssetDatabase.LoadAssetAtPath<Texture2D>(assetPath);
            if (texture != null)
            {
                string fileName = System.IO.Path.GetFileNameWithoutExtension(assetPath);
                prefabThumbnails[fileName] = texture;
            }
        }
    }

    private void LoadPrefabsInFolder(string folder, string key)
    {
        if (folder == null)
        {
            return;
        }
        string[] guids = AssetDatabase.FindAssets("t:Prefab", new[] { folder });
        List<GameObject> prefabs = new List<GameObject>();

        foreach (string guid in guids)
        {
            string assetPath = AssetDatabase.GUIDToAssetPath(guid);
            GameObject prefab = AssetDatabase.LoadAssetAtPath<GameObject>(assetPath);
            if (prefab != null)
            {
                prefabs.Add(prefab);
            }
        }

        if (prefabs.Count > 0)
        {
            folderPrefabs[key] = prefabs;
        }
    }

    private void OnGUI()
    {
        //Debug.Log("OnGUI");
        DrawSearchBar();
        EditorGUILayout.BeginHorizontal();
        DrawLeftPanel();
        DrawRightPanel();
        EditorGUILayout.EndHorizontal();
    }

    private void DrawSearchBar()
    {
        EditorGUILayout.BeginHorizontal(GUILayout.ExpandWidth(true));
        GUILayout.Label("Search:", GUILayout.Width(50));

        searchQuery = EditorGUILayout.TextField(searchQuery, GUILayout.ExpandWidth(true));

        if (GUILayout.Button("X", GUILayout.Width(20))) // X 버튼 추가
        {
            searchQuery = null; // 검색창 텍스트를 null로 설정
            GUI.FocusControl(null); // 검색창의 포커스를 해제하여 즉시 업데이트
        }

        EditorGUILayout.EndHorizontal();
    }
    private void DrawLeftPanel()
    {
        leftPanelScrollPosition = EditorGUILayout.BeginScrollView(leftPanelScrollPosition, GUILayout.Width(70), GUILayout.Height(position.height - 50));
        EditorGUILayout.BeginVertical();

        foreach (var folder in folderPaths)
        {
            string folderKey = folder.Key;
            string iconKey = folderKey + (selectedFolder == folderKey ? "_f" : "_d");
            Texture2D icon = prefabThumbnails.ContainsKey(iconKey) ? prefabThumbnails[iconKey] : null;

            if (GUILayout.Button(new GUIContent(icon), GUILayout.Width(50), GUILayout.Height(50)))
            {
                selectedFolder = folder.Key;
                scrollPosition = Vector2.zero;
                Repaint();
            }
            GUIStyle centeredStyle = new GUIStyle(GUI.skin.label)
            {
                alignment = TextAnchor.MiddleCenter,
                fontStyle = selectedFolder == folderKey ? FontStyle.Bold : FontStyle.Normal
            };
            centeredStyle.normal.textColor = selectedFolder == folderKey ? Color.white : new Color(0.75f, 0.75f, 0.75f);

            EditorGUILayout.LabelField(folder.Key, centeredStyle, GUILayout.Width(50));
            EditorGUILayout.Space();
        }

        EditorGUILayout.EndVertical();
        EditorGUILayout.EndScrollView();
    }

    private void DrawRightPanel()
    {
        scrollPosition = EditorGUILayout.BeginScrollView(scrollPosition);

        if (!string.IsNullOrEmpty(selectedFolder))
        {
            List<GameObject> prefabsToShow = new List<GameObject>();

            if (selectedFolder == "All")
            {
                // folderPrefabs에 있는 모든 프리팹들을 합침
                foreach (var prefabs in folderPrefabs.Values)
                {
                    prefabsToShow.AddRange(prefabs);
                }
            }
            else if (folderPrefabs.ContainsKey(selectedFolder))
            {
                prefabsToShow = folderPrefabs[selectedFolder];
            }

            if (prefabsToShow.Count > 0)
            {
                DrawPrefabsGrid(prefabsToShow);
            }
            else
            {
                EditorGUILayout.LabelField("No prefabs found in the selected folder.", GUILayout.Width(300));
            }
        }
        else
        {
            EditorGUILayout.LabelField("No folder selected.", GUILayout.Width(300));
        }

        EditorGUILayout.EndScrollView();
    }

    private List<GameObject> FilterPrefabs(List<GameObject> prefabs, string query)
    {
        if (string.IsNullOrEmpty(query))
        {
            return prefabs;
        }

        return prefabs.FindAll(prefab => prefab.name.ToLower().Contains(query.ToLower()));
    }

    private void DrawPrefabsGrid(List<GameObject> prefabs)
    {
        List<GameObject> filteredPrefabs = FilterPrefabs(prefabs, searchQuery);
        int iconsPerRow = Mathf.FloorToInt((position.width - 140) / prefabIconSize);
        int row = 0;

        for (int i = 0; i < filteredPrefabs.Count; i++)
        {
            if (i % iconsPerRow == 0)
            {
                if (row > 0) EditorGUILayout.EndHorizontal();
                EditorGUILayout.BeginHorizontal();
                row++;
            }
            DrawPrefabIcon(filteredPrefabs[i]);
        }

        if (row > 0) EditorGUILayout.EndHorizontal();
    }

    private void DrawPrefabIcon(GameObject prefab)
    {
        GUILayout.BeginVertical(GUILayout.Width(prefabIconSize + 20), GUILayout.Height(prefabIconSize + 20));
        if (prefabThumbnails.TryGetValue(prefab.name, out Texture2D thumbnail))
        {
            Rect iconRect = GUILayoutUtility.GetRect(prefabIconSize, prefabIconSize, GUILayout.Width(prefabIconSize), GUILayout.Height(prefabIconSize));
            GUI.DrawTexture(iconRect, thumbnail, ScaleMode.ScaleToFit);
            HandleIconEvents(prefab, iconRect);
        }

        // 프리팹 이름앞 폴더명 + "_" 제거
        string pattern = Regex.Escape(selectedFolder);
        string displayName = Regex.Replace(prefab.name, pattern + "_", "", RegexOptions.IgnoreCase);

        GUILayout.Label(displayName, GUILayout.Width(prefabIconSize), GUILayout.Height(20));
        GUILayout.EndVertical();
    }

    private void HandleIconEvents(GameObject prefab, Rect iconRect)
    {
        if (Event.current.type == EventType.Repaint && selectedPrefab == prefab)
        {
            DrawSelectButton(iconRect, 4, Color.white);
        }

        if (Event.current.type == EventType.MouseDown && iconRect.Contains(Event.current.mousePosition))
        {
            if (selectedPrefab == prefab)
            {
                // 동일한 버튼을 다시 클릭한 경우 선택 취소
                selectedPrefab = null;
                SceneView.RepaintAll();
            }
            else
            {
                // 새로운 버튼을 클릭한 경우 선택
                selectedPrefab = prefab;
                DragAndDrop.PrepareStartDrag();
                DragAndDrop.objectReferences = new Object[] { prefab };
                DragAndDrop.StartDrag(prefab.name);
                Event.current.Use();
            }
        }
    }

    private void DrawSelectButton(Rect rect, int thickness, Color color)
    {
        EditorGUI.DrawRect(new Rect(rect.x, rect.y, rect.width, thickness), color); // Top
        EditorGUI.DrawRect(new Rect(rect.x, rect.y + rect.height - thickness, rect.width, thickness), color); // Bottom
        EditorGUI.DrawRect(new Rect(rect.x, rect.y, thickness, rect.height), color); // Left
        EditorGUI.DrawRect(new Rect(rect.x + rect.width - thickness, rect.y, thickness, rect.height), color); // Right
    }


    private void DrawPopup(SceneView sceneView)
    {
        Handles.BeginGUI();
        GUIStyle style = new GUIStyle(GUI.skin.box)
        {
            alignment = TextAnchor.MiddleCenter,
            fontSize = 20,
            normal = { textColor = Color.yellow }
        };

        Color originalColor = GUI.backgroundColor;
        GUI.backgroundColor = new Color(0, 0, 0, 0.75f);

        string message = cachedPopupLanguage;
        GUILayout.BeginArea(new Rect((sceneView.position.width - 400) / 2, 10, 400, 100), message, style);
        GUILayout.EndArea();

        GUI.backgroundColor = originalColor;
        Handles.EndGUI();
    }

    private void OnSceneGUI(SceneView sceneView)
    {
        if (selectedPrefab == null)
        {
            return;
        }

        DrawPopup(sceneView);

        Selection.activeObject = null;
        Event e = Event.current;

        if (e.type == EventType.MouseDown && e.button == 0 && selectedPrefab != null)
        {
            Ray ray = HandleUtility.GUIPointToWorldRay(e.mousePosition);
            if (Physics.Raycast(ray, out RaycastHit hit))
            {
                CreatePrefabInstance(selectedPrefab, hit.point);
                e.Use();
            }
            else
            {
                Plane plane = new Plane(Vector3.up, Vector3.zero);
                if (plane.Raycast(ray, out float distance))
                {
                    CreatePrefabInstance(selectedPrefab, ray.GetPoint(distance));
                    e.Use();
                }
            }
        }

        if ((e.type == EventType.MouseDown && e.button == 1) || (e.type == EventType.KeyDown && e.keyCode == KeyCode.Escape))
        {
            selectedPrefab = null;
            e.Use();
        }
    }

    private void CreatePrefabInstance(GameObject prefab, Vector3 position)
    {
        GameObject instance = (GameObject)PrefabUtility.InstantiatePrefab(prefab);
        if (instance != null)
        {
            if (parentObject == null)
            {
                parentObject = GameObject.Find("Objects");
            }
            instance.transform.position = position;
            instance.transform.SetParent(parentObject.transform);
            Undo.RegisterCreatedObjectUndo(instance, "Create " + instance.name);
            Selection.activeObject = null;
        }
    }
}
