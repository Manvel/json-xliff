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

  function json2xliff(source, target, locale, fileName)
  {
    const units = [];
    for (const stringId in source)
    {
      const sourceMsg = source[stringId].message;
      const targetMsg = target[stringId].message;

      // Question: What to do if targetMsg doesn't exist?
      units.push(`<unit id="${stringId}">
      <segment>
       <source>${sourceMsg}</source>
       <target>${targetMsg}</target>
      </segment>
     </unit>`);
    }
    const xliff = `<xliff xmlns="urn:oasis:names:tc:xliff:document:2.0" version="2.0"
    srcLang="en_US" trgLang="${locale}">
    <file original="${fileName}">
      ${units.join("\n")}
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
