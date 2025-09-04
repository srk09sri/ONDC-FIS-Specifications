function getStringAfterEquals(inputString) {
  const index = inputString.indexOf("=");
  if (index !== -1) {
    return inputString.slice(index + 1).trim();
  } else {
    return "";
  }
}

async function readBuildFile(branchName) {
  if (!branchName) return;
  const url = `https://api.github.com/repos/ondc-official/ONDC-FIS-Specifications/contents/ui/build.js?ref=${branchName}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: "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",
      },
    });
    const formattedResponse = await response?.json();

    /*
      For larger build.js files > 1mb,
      the github api is returning empty for content key,
      sol: reading data from download_url
    */

     
    // let splitedText = atob(formattedResponse?.content);
    // build_spec = JSON.parse(getStringAfterEquals(splitedText));
    // onFirstLoad(build_spec);
    
    // if(formattedResponse?.download_url){
    //   setTimeout(async ()=>{
    //     const rawResponse = await fetch(formattedResponse.download_url, {
    //       // headers: {
    //       //   Authorization: "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",
    //       // },
    //     });
    //     const formattedrawResponse = await rawResponse?.text();
    //     build_spec = JSON.parse(getStringAfterEquals(formattedrawResponse));
    //     onFirstLoad(build_spec);
    //   },1200)
    // }
    // else{
    //   const urlWithoutQuery = window.location.origin + window.location.pathname;
    //   window.history.replaceState(null, '', urlWithoutQuery);
    //   const home = document.getElementById("home")
    //   const loader = document.getElementById("loader")
    //   home.style.display = "block"
    //   loader.style.display = "none"
    // }
     if(formattedResponse?.git_url){
      setTimeout(async ()=>{
        const rawResponse = await fetch(formattedResponse.git_url, {
          // headers: {
          //   Authorization: "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",
          // },
        });
        let formattedrawResponse = await rawResponse?.text();
        formattedrawResponse =  JSON.parse(formattedrawResponse)
        let splitedText = atob(formattedrawResponse?.content);
        build_spec = JSON.parse(getStringAfterEquals(splitedText));
        onFirstLoad(build_spec);
      },1200)
    }
    else{
      const urlWithoutQuery = window.location.origin + window.location.pathname;
      window.history.replaceState(null, '', urlWithoutQuery);
      const home = document.getElementById("home")
      const loader = document.getElementById("loader")
      home.style.display = "block"
      loader.style.display = "none"
    }

   
  } catch (error) {
    console.log("Error fetching contract", error?.message || error);
    //alert('Something went wrong, Please try again later')
  }
}

async function fetchRequest(url){
  try{
    const response = await fetch(url, {
      headers: {
        Authorization: "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",
      },
    });
    return await response?.json();
  }catch{
    console.log("Error fetching contract", error?.message || error);
  }
}

async function fetchBranches() {
  try {
  const BRANCHES_URL= "https://api.github.com/repos/ondc-official/ONDC-FIS-Specifications/branches?per_page=100&page=1";
  const TAGS_URL= "https://api.github.com/repos/ondc-official/ONDC-FIS-Specifications/tags";
                  
  let response1, response2;
  response1 = await fetchRequest(BRANCHES_URL)
  response2 = await fetchRequest(TAGS_URL)
  const response = [...response1,...response2]

  return response
  } catch(e) {
    console.log("Error while fetching branches")
  }
}

async function loadContracts() {
  //fetch branches & tags from repo
  const response = await fetchBranches()

  const selectedOption = document.getElementById("contract-dropdown");
  selectedOption.innerHTML = "";
  
  const urlParams = new URLSearchParams(window.location.search);
  const branchName = urlParams.get('branch');

  response.forEach((flow, index) => {
    if(index === 0 && !branchName) {
      const url = new URL(window.location);
      url.searchParams.set('branch', flow.name);
      window.history.pushState({}, '', url);
    }
    var option = document.createElement("option");
    option.text = flow.name;
    selectedOption.add(option);
  });

  if(branchName) {
    document.getElementById("contract-dropdown").value = branchName
    const url = new URL(window.location);
    url.searchParams.set('branch', branchName);
    window.history.pushState({}, '', url);
  }
  readBuildFile(response[0]?.name);
}

function upadteContract() {
  const selectedOption = document.getElementById("contract-dropdown")?.value;

  const urlWithoutQuery = window.location.origin + window.location.pathname;
  window.history.replaceState(null, '', urlWithoutQuery);

  const url = new URL(window.location);
  url.searchParams.set('branch', selectedOption);
  gtag("event", "protocol", {
    use_case: selectedOption,
    page_location: window.location.href
  });
  window.history.pushState({}, '', url);

  init()
}

function toggleHomePage() {
  const content = document.getElementById("content")
  const home = document.getElementById("home")
  const loader = document.getElementById("loader")

  // show Branch selector on home, hide quick-nav
  if (typeof setVersionVisibility === 'function') setVersionVisibility(true);
  if (typeof showQuickNav === 'function') showQuickNav(false);
  if (typeof showHeaderSearch === 'function') showHeaderSearch(true);

  content.style.display = "none"
  home.style.display = "block"
  loader.style.display = "none"

  const urlWithoutQuery = window.location.origin + window.location.pathname;
  window.history.replaceState(null, '', urlWithoutQuery);
  renderBranchesTable()
}


function resolveHomePage(branch, tab) {
  const url = new URL(window.location);
  url.searchParams.set('branch', branch);
  
  if(tab) {
    url.searchParams.set('tabId', tab);
  }
  
  window.history.pushState({}, '', url);

  const content = document.getElementById("content")
  const home = document.getElementById("home")
  const loader = document.getElementById("loader")

  // show Branch selector for branch view (restore original behavior)
  if (typeof setVersionVisibility === 'function') setVersionVisibility(true);
  if (typeof showQuickNav === 'function') showQuickNav(false);
  if (typeof showHeaderSearch === 'function') showHeaderSearch(false);

  content.style.display = "none"
  home.style.display = "none"
  loader.style.display = "flex"

  document.getElementById("contract-dropdown").value = branch
  readBuildFile(branch)
}

function tabClicked(tab) {
  const url = new URL(window.location);
  url.searchParams.set('tabId', tab);
  window.history.pushState({}, '', url);
}

function populateVersionDropdown(branches) {
  const selectedOption = document.getElementById("contract-dropdown");
  selectedOption.innerHTML = "";

  branches.forEach((flow) => {
    var option = document.createElement("option");
    option.text = flow.code;
    selectedOption.add(option);
  });

  const urlParams = new URLSearchParams(window.location.search);
  const branchName = urlParams.get('branch');

  if(branchName) {
    document.getElementById("contract-dropdown").value = branchName
  }
}

async function renderBranchesTable() {
  const response = await fetchBranches();

  const filteredBranches = BRANCHES.filter(item1 =>
    response.some(item2 => item1.code === item2.name)
  );

  const statusColors = {
    RELEASED: "#28a745",
    DRAFT: "#ffc107",
    DEPRECATED: "#dc3545",
    TO_BE_DEPRECATED: "#ff851b"
  };

  const container = document.getElementById("branchesList");
  if (!container) return;
  let html = '';

  filteredBranches.forEach(branch => {
    const borderColor = statusColors[branch.status] || "#6c757d";
    const statusClass = `status-${branch.status || ''}`.replace(/\s+/g, '_');

    // Display full branch.code (no shortening)
    html += `
      <div class="branch-card" style="border-left-color: ${borderColor};">
        <div style="display:flex;gap:12px;align-items:flex-start;">
          <div style="flex:1">
            <h5 class="branch-title">${branch.name}</h5>
            <p class="branch-desc">${branch.short_desc || ''}</p>
          </div>
          <div class="branch-meta">
            <div class="status-badge ${statusClass}">${branch.status}</div>
            <div class="branch-code mt-2" title="${branch.code}">
              <a href="#" class="branchLink" onclick="resolveHomePage('${branch.code}');return false;">${branch.code}</a>
            </div>
          </div>
        </div>
        <div class="branch-actions">
          <button class="btn btn-sm btn-outline-secondary btn-branch-copy" onclick="copyBranch('${branch.code}', this)">Copy</button>
          <button class="btn btn-sm btn-primary btn-branch-open" onclick="resolveHomePage('${branch.code}')">Open</button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  populateVersionDropdown(filteredBranches);
}

function copyBranch(code, btn) {
  if (!navigator.clipboard) {
    const ta = document.createElement('textarea');
    ta.value = code;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  } else {
    navigator.clipboard.writeText(code).catch(()=>{});
  }
  if (btn) {
    const orig = btn.innerText;
    btn.innerText = 'Copied';
    btn.disabled = true;
    setTimeout(()=>{ btn.innerText = orig; btn.disabled = false; }, 1400);
  }
}

function init() {
  const urlParams = new URLSearchParams(window.location.search);
  const branchName = urlParams.get('branch');

  const content = document.getElementById("content")
  const home = document.getElementById("home")
  const loader = document.getElementById("loader")

  // centralize header visibility: show Branch dropdown on home OR branch view
  if(!branchName) {
    if (typeof setVersionVisibility === 'function') setVersionVisibility(true);
    if (typeof showQuickNav === 'function') showQuickNav(false);
    if (typeof showHeaderSearch === 'function') showHeaderSearch(true);

    toggleHomePage()
  } else {
    // show Branch selector even when a branch is selected
    if (typeof setVersionVisibility === 'function') setVersionVisibility(true);
    if (typeof showQuickNav === 'function') showQuickNav(false);
    if (typeof showHeaderSearch === 'function') showHeaderSearch(false);

    renderBranchesTable()
    readBuildFile(branchName)
  }
}

window.onload = init
