import JSZip from "jszip";

function normalizeUsername(value) {
  const username = String(value ?? "")
    .trim()
    .replace(/^@+\s*/, "")
    .trim()
    .toLowerCase();

  if (
    !username ||
    username === "undefined" ||
    username === "null"
  ) {
    return null;
  }

  return username;
}

function usernameFromEntry(entry) {
  const stringList = Array.isArray(entry?.string_list_data)
    ? entry.string_list_data
    : [];

  // 1º Prioridade: Tenta o campo explícito value dentro de string_list_data (mais confiável)
  for (const item of stringList) {
    const username = normalizeUsername(item?.value);
    if (username) {
      return username;
    }
  }

  // 2º Prioridade: Tenta os campos diretos do objeto (title ou username), ignorando se estiverem vazios
  for (const candidate of [entry?.title, entry?.username]) {
    const username = normalizeUsername(candidate);
    if (username) {
      return username;
    }
  }

  // 3º Prioridade: Extrai o nome da URL do perfil (href) considerando o padrão /_u/
  for (const item of stringList) {
    const href = item?.href;

    if (typeof href !== "string") {
      continue;
    }

    try {
      const url = new URL(href);
      const hostname = url.hostname.toLowerCase();

      if (
        hostname !== "instagram.com" &&
        !hostname.endsWith(".instagram.com")
      ) {
        continue;
      }

      const pathSegments = url.pathname
        .split("/")
        .filter(Boolean);

      const usernameFromUrl =
        pathSegments[0] === "_u"
          ? pathSegments[1]
          : pathSegments[0];

      const username = normalizeUsername(usernameFromUrl);

      if (username) {
        return username;
      }
    } catch {
      // Ignora URLs inválidas
    }
  }

  return null;
}

function collectEntries(json) {
  if (Array.isArray(json)) {
    return json;
  }

  if (Array.isArray(json?.relationships_following)) {
    return json.relationships_following;
  }

  if (Array.isArray(json?.relationships_followers)) {
    return json.relationships_followers;
  }

  const values = Object.values(json);
  for (const val of values) {
    if (Array.isArray(val)) {
      return val;
    }
  }

  return [];
}

function getBasename(path) {
  return path.split("/").pop().toLowerCase();
}

function isFollowersFile(path) {
  const base = getBasename(path);
  return base.includes("followers");
}

function isFollowingFile(path) {
  const base = getBasename(path);
  return base.includes("following") && !base.includes("followers");
}

export async function parseInstagramFiles(fileList) {
  const files = Array.from(fileList ?? []);

  if (!files.length) {
    throw new Error("Selecione um arquivo ZIP ou arquivos JSON.");
  }

  const jsonFiles = [];

  for (const file of files) {
    if (file.name.toLowerCase().endsWith(".zip")) {
      const zip = await JSZip.loadAsync(file);

      for (const entry of Object.values(zip.files)) {
        if (entry.dir) {
          continue;
        }

        const path = entry.name.replace(/\\/g, "/");

        if (isFollowersFile(path) || isFollowingFile(path)) {
          jsonFiles.push({
            name: path,
            text: await entry.async("string"),
          });
        }
      }
    } else {
      jsonFiles.push({
        name: file.name,
        text: await file.text(),
      });
    }
  }

  const followers = new Set();
  const following = new Set();

  let foundFollowers = false;
  let foundFollowing = false;

  for (const file of jsonFiles) {
    const path = file.name.replace(/\\/g, "/");

    let parsed;

    try {
      parsed = JSON.parse(file.text.replace(/^\uFEFF/, ""));
    } catch {
      continue;
    }

    const entries = collectEntries(parsed);

    if (isFollowersFile(path)) {
      foundFollowers = true;

      for (const entry of entries) {
        const username = usernameFromEntry(entry);
        if (username) {
          followers.add(username);
        }
      }
    } else if (isFollowingFile(path)) {
      foundFollowing = true;

      for (const entry of entries) {
        const username = usernameFromEntry(entry);
        if (username) {
          following.add(username);
        }
      }
    }
  }

  if (!foundFollowers || !foundFollowing) {
    throw new Error(
      "Não encontrei os arquivos de seguidores e seguindo dentro do ZIP."
    );
  }

  if (followers.size === 0 && following.size === 0) {
    throw new Error(
      "Os arquivos foram encontrados, mas nenhum usuário válido foi identificado."
    );
  }

  const notFollowingBack = [...following]
    .filter((username) => !followers.has(username))
    .sort((a, b) => a.localeCompare(b));

  const notFollowedByYou = [...followers]
    .filter((username) => !following.has(username))
    .sort((a, b) => a.localeCompare(b));

  return {
    followerCount: followers.size,
    followingCount: following.size,
    notFollowingBack,
    notFollowedByYou,
  };
}