(function()
{
  const form = document.querySelector("form");
  const [sourceFile, targetFile] = document.querySelectorAll("[type='file']");
  const locales = document.querySelector("select");
  updateLanguages();
  form.addEventListener("submit", async(e) =>
  {
    e.preventDefault();
    const sourceJson = await readFileInput(sourceFile);
    const targetJson = await readFileInput(targetFile);
    const fileName = sourceFile.files[0].name;
    const locale = locales.options[locales.selectedIndex].value;
    const result = json2xliff(sourceJson, targetJson, locale, fileName);
    download(`${fileName}.xlf`, result);
  });

  function updateLanguages()
  {
    const langauges = ["ar_EG", "de_DE", "el_GR", "es_ES", "fr_FR", "hu_HU",
    "it_IT", "ja_JP", "ko_KR", "nl_NL", "pl_PL", "pt_BR",
    "ru_RU", "tr_TR", "zh_CN"];
    langauges.forEach((locale) => 
    {
      const opt = document.createElement('option');
      opt.value = locale;
      opt.textContent = locale;
      document.querySelector("select").appendChild(opt);
    });
  }

  function readFileInput(input)
  {
    return new Promise((resolve) =>
    {
      const reader = new FileReader();
      reader.onload = (event) =>
      {
        const jsonObj = JSON.parse(event.target.result);
        resolve(jsonObj);
      }
      reader.readAsText(input.files[0]);
    });
  }

  function replacePlaceholders(placeholders, prefix, txt)
  {
    for (const placeholder in placeholders)
    {
      txt = txt.replace(new RegExp(`\\$${placeholder}\\$`, "g"),
                        `<x id="${prefix}_${placeholder}" />`);
    }
    return txt;
  }

  function replaceInlinePlaceholders(stringId, txt)
  {
    txt = txt.replace(new RegExp("<(a|em|slot|strong)(\\d)?>(.*?)<\\/\\1\\2>", "g"), `<g id="${stringId}_$1$2"><mrk mtype="protected">$3</mrk></g>`);
    return txt;
  }

  function json2xliff(source, target, locale, fileName)
  {
    const units = [];
    for (const stringId in source)
    {
      const sourceMsg = source[stringId].message;
      const targetMsg = target[stringId].message;
      const description = source[stringId].description;

      const placeholders = source[stringId].placeholders;
      const sourceXlf = replaceInlinePlaceholders(stringId, replacePlaceholders(placeholders, stringId, sourceMsg));
      const targetXlf = replaceInlinePlaceholders(stringId, replacePlaceholders(placeholders, stringId, targetMsg));

      const sourceElem = `<source>${sourceXlf}</source>`;
      const targetElem = targetMsg ? `<target>${targetXlf}</target>` : "";
      const noteElem = description ? `<note>${description}</note>` : "";

      // Question: What to do if targetMsg doesn't exist?
      units.push(`<trans-unit id="${stringId}">
        <segment>
          ${sourceElem}
          ${targetElem}
          ${noteElem}
        </segment>
      </trans-unit>`);
    }
    const xliff = `<?xml version="1.0" encoding="UTF-8"?>
<xliff xmlns="urn:oasis:names:tc:xliff:document:1.2"
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.2"
xsi:schemaLocation="urn:oasis:names:tc:xliff:document:1.2
http://docs.oasis-open.org/xliff/v1.2/os/xliff-core-1.2-strict.xsd">
  <file original="${fileName}" datatype="plaintext" source-language="en_US" target-language="${locale}">
    <body>
      ${units.join("\n      ")}
    </body>
  </file>
</xliff>`;
    return xliff;
  }

  function download(filename, text)
  {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
})();
