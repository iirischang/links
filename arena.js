	// This allows us to process/render the descriptions, which are in Markdown!
	// More about Markdown: https://en.wikipedia.org/wiki/Markdown
	let markdownIt = document.createElement('script')
	markdownIt.src = 'https://cdn.jsdelivr.net/npm/markdown-it@14.0.0/dist/markdown-it.min.js'
	document.head.appendChild(markdownIt)

	// Okay, Are.na stuff!
	let channelSlug = 'japanese-food-oxza2bhowo8' // The “slug” is just the end of the URL

	let blockList = [];

	// First, let’s lay out some *functions*, starting with our basic metadata:
	let placeChannelInfo = (data) => {
	// Target some elements in your HTML:
	let channelTitle = document.querySelector('#channel-title')
	let channelDescription = document.querySelector('#channel-description')
	let channelCount = document.querySelector('#channel-count')
	let channelLink = document.querySelector('#channel-link')


	// Then set their content/attributes to our data:
	channelTitle.innerHTML = data.title
	channelDescription.innerHTML = window.markdownit().render(data.metadata.description) // Converts Markdown → HTML
	channelCount.innerHTML = data.contents.length;
	channelLink.href = `https://www.are.na/channel/${channelSlug}`
	}

	let createButtonGrid = (blocks) => {
		const buttonGrid = document.getElementById('buttonGrid');
		buttonGrid.innerHTML = '';
		// buttonGrid.style.transform = 'translate(-50%, -50%)';

		// let buttonCount = 0;
		let imageBlocks = [];
		let videoBlocks = [];
		let audioBlocks = [];
		let linkBlocks = [];
		let mapBlocks = [];


		blocks.forEach((block) => {
			if (block.title && block.title.includes('Japanese TV commercial')) {
				return;
			}

			if (block.class == 'Image') {
				imageBlocks.push(block);
			}
			else if ((block.class == 'Media' && block.embed.type.includes('video')) ||
					(block.class == 'Attachment' && block.attachment.content_type.includes('video'))) {
				videoBlocks.push(block);
			}
			else if (block.class == 'Attachment' && block.attachment.content_type.includes('audio')) {
				audioBlocks.push(block);
			}
			else if (block.class == 'Link') {
				if (block.source && (block.source.url.includes('maps.google') ||
					block.source.url.includes('google.com/maps') ||
					block.title && block.title.toLowerCase().includes('map'))) {
					mapBlocks.push(block);
			} else {
				linkBlocks.push(block);
			}
			}
		});

		const maxPerRow = 11;
		imageBlocks = imageBlocks.slice(0, maxPerRow);

		let secondRowBlocks = [];
		if (videoBlocks.length < 3) {
			secondRowBlocks = [...videoBlocks];
			const remainingSpace = maxPerRow - secondRowBlocks.length;
			const audioToAdd = Math.min(remainingSpace, audioBlocks.length);
			if (audioToAdd > 0) {
				secondRowBlocks = secondRowBlocks.concat(audioBlocks.slice(0, audioToAdd));
				audioBlocks = audioBlocks.slice(audioToAdd);
			}
			const stillRemaining = maxPerRow - secondRowBlocks.length;
			if (stillRemaining > 0 && mapBlocks.length > 0) {
				secondRowBlocks = secondRowBlocks.concat(mapBlocks.slice(0, stillRemaining));
				mapBlocks = mapBlocks.slice(stillRemaining);
			}
		} else {
			secondRowBlocks = videoBlocks.slice(0, maxPerRow);
		}

		let thirdRowBlocks = [...audioBlocks, ...linkBlocks, ...mapBlocks].slice(0, maxPerRow);

		imageBlocks.forEach((block) => {
			const button = document.createElement('button');
			button.className = 'vending-button image-button';
			button.innerHTML = "";
			button.addEventListener('click', () => showModal(block));
			buttonGrid.appendChild(button);
		});

		for (let i = imageBlocks.length; i < maxPerRow; i++) {
			const emptyButton = document.createElement('button');
			emptyButton.className = 'vending-button empty-button';
			emptyButton.style.animationDuration = '0s';
			emptyButton.style.opacity = '0.3';
			buttonGrid.appendChild(emptyButton);
		}

		secondRowBlocks.forEach((block) => {
			const button = document.createElement('button');
			
			if ((block.class == 'Media' && block.embed.type.includes('video')) ||
				(block.class == 'Attachment' && block.attachment.content_type.includes('video'))) {
				button.className = 'vending-button video-button';
			} else if (block.class == 'Attachment' && block.attachment.content_type.includes('audio')) {
			button.className = 'vending-button audio-button';
			} else if (block.class == 'Link' && block.source &&
					(block.source.url.includes('maps.google') ||
					block.source.url.includes('google.com/maps') ||
					(block.title && block.title.toLowerCase().includes('map')))) {
			button.className = 'vending-button map-button';	
			} else {
			button.className = 'vending-button link-button';
			}
			button.innerHTML = "";
			button.addEventListener('click', () => showModal(block));
			buttonGrid.appendChild(button);
		});

		for (let i = secondRowBlocks.length; i < maxPerRow; i++) {
			const emptyButton = document.createElement('button');
			emptyButton.className = 'vending-button empty-button';
			emptyButton.style.animationDuration = '0s';
			emptyButton.style.opacity = '0.3';
			buttonGrid.appendChild(emptyButton);
		}

		thirdRowBlocks.forEach((block) => {
			const button = document.createElement('button');

			if(block.class == 'Attachment' && block.attachment.content_type.includes('audio')){
				button.className = 'vending-button audio-button';
			} else if (mapBlocks.includes(block)) {
				button.className = 'vending-button map-button';
			} else {
				button.className = 'vending-button link-button';
			}
			button.innerHTML = "";
			button.addEventListener('click', () => showModal(block));
			buttonGrid.appendChild(button);
		});

		for (let i = thirdRowBlocks.length; i < maxPerRow; i++) {
			const emptyButton = document.createElement('button');
			emptyButton.className = 'vending-button empty-button';
			emptyButton.style.animationDuration = '0s';
			emptyButton.style.opacity = '0.3';
			buttonGrid.appendChild(emptyButton);
		}

	// adjustButtonPositions();

	}

	let showModal = (block) => {
		console.log('Modal triggered for:', block);
		const modal = document.getElementById('itemModal');
		const modalBody = modal.querySelector('.modal-body');

		let content = renderBlock(block);
		modalBody.innerHTML = content;
		modal.classList.add('active');

	}



	// Then our big function for specific-block-type rendering:
	let renderBlock = (block) => {
	// To start, a shared `ul` where we’ll insert all our blocks
	let content;
	let channelBlocks = document.querySelector('#channel-blocks')


	if (block.title && block.title.includes ('Japanese TV commercial')) {
		return;
	}


	// Links!
	if (block.class == 'Link') {
		content =
			`
				<h3>${ block.title || 'Link'}</h3>
				<img src="${ block.image.original.url }" style="max-width: 100%; height: auto;">
				${block.description_html || ''}
				<p><a href="${ block.source.url }">Go Link 🇯🇵</a></p>
			`;
		
	}


	// Images!
	else if (block.class == 'Image') {
		content =
			`
				<h3>${ block.title || 'Image'}</h3>
				<img src="${ block.image.original.url }" style="max-width: 100%; height: auto;">
				${block.description_html || ''}
			`;
		
		// …up to you!
	}


	// Text!
	else if (block.class == 'Text') {
		content = `
				<h3>${ block.title || 'Text'}</h3>
				${block.content_html || block.description_html || ''}
		`;
		// …up to you!
	}


	// Uploaded (not linked) media…
	else if (block.class  == 'Attachment') {
		let attachment = block.attachment.content_type // Save us some repetition


		// Uploaded videos!
		if (attachment.includes('video')) {
			// …still up to you, but we’ll give you the `video` element:
			content =
				`
					<h3>${ block.title || 'Video'}</h3>
					<video controls src="${ block.attachment.url }" style="max-width: 100%"></video>
					${block.content_html || ''}
				`;
			// channelBlocks.insertAdjacentHTML('beforeend', videoItem)
			// More on video, like the `autoplay` attribute:
			// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video
		}


		// Uploaded PDFs!
		else if (attachment.includes('pdf')) {
			// …up to you!
		}


		// Uploaded audio!
		else if (attachment.includes('audio')) {
			// …still up to you, but here’s an `audio` element:
			content =
				`
					<h3>${ block.title || 'Audio'}</h3>
					<p><em>Audio</em></p>
					<audio controls src="${ block.attachment.url }" style="width: 100%; height: 50px"></audio>
					${block.description_html || ''}
				`
			// channelBlocks.insertAdjacentHTML('beforeend', audioItem)
			// More on audio: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio
		}
	}


	// Linked media…
	else if (block.class == 'Media') {
		let embed = block.embed.type


		// Linked video!
		if (embed.includes('video')) {
			// …still up to you, but here’s an example `iframe` element:
			const description = block.description_html || block.description || '';
			const hasDescription = description.trim().length > 0;
			content =
				`
					<h3>${ block.title || 'Video'}</h3>
					<p><em>Linked Video</em></p>
					${ block.embed.html }
					${hasDescription ?
						`<div class="block-description">${description}</div>`:
						'<div class="no-description"></div>'}
				`;
			// channelBlocks.insertAdjacentHTML('beforeend', linkedVideoItem)
			// More on iframe: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe
		}


		// Linked audio!
		else if (embed.includes('rich')) {
			// …up to you!
		}
	}
	
	return content;
}

	document.querySelector('.close-button').addEventListener('click', () => {
		document.getElementById('itemModal').classList.remove('active');
	});

	// It‘s always good to credit your work:
	let renderUser = (user, container) => { // You can have multiple arguments for a function!
	let userAddress =
		`
		<address>
			<img src="${ user.avatar_image.display }">
			<h3>${ user.first_name }</h3>
			<p><a href="https://are.na/${ user.slug }">Are.na profile ↗</a></p>
		</address>
		`
	container.insertAdjacentHTML('beforeend', userAddress)
	}


	// Now that we have said what we can do, go get the data:
	fetch(`https://api.are.na/v2/channels/${channelSlug}?per=100`, { cache: 'no-store' })
	.then((response) => response.json()) // Return it as JSON data
	.then((data) => { // Do stuff with the data
		console.log(data) // Always good to check your response!
		placeChannelInfo(data) // Pass the data to the first function

		blockList = data.contents.reverse();

		createButtonGrid(blockList);


		// Loop through the `contents` array (list), backwards. Are.na returns them in reverse!
		blockList.forEach((block) => {
			// console.log(block) // The data for a single block
			renderBlock(block) // Pass the single block data to the render function
		});


		// Also display the owner and collaborators:
		let channelUsers = document.querySelector('#channel-users') // Show them together
		data.collaborators.forEach((collaborator) => renderUser(collaborator, channelUsers))
		renderUser(data.user, channelUsers)
	})

		// change bg color
		// create button
		const buttonContainer = document.createElement('div');
		buttonContainer.style.position = 'fixed';
		buttonContainer.style.bottom = '20px';
		buttonContainer.style.right = '20px';
		buttonContainer.style.display = 'flex';
		buttonContainer.style.gap = '10px';
		buttonContainer.style.zIndex = '1000';

		function adjustButtonPositions() {
			if (window.innerWidth <= 768) {
				buttonContainer.style.bottom = '15px'
				buttonContainer.style.position = 'fixed'
				buttonContainer.style.left = '40px'
			} else {
				buttonContainer.style.bottom = '20px'
				buttonContainer.style.right = '40px'
			}
		}

		adjustButtonPositions();

		window.addEventListener('resize', adjustButtonPositions);

		// lunch-orange
		const lunchButton = document.createElement('button');
		lunchButton.textContent = 'Lunch';
		lunchButton.style.padding = '8px 15px';
		lunchButton.style.backgroundColor = '#EB9B2D';
		lunchButton.style.color = '#ffffff';
		lunchButton.style.border = 'none';
		lunchButton.style.fontFamily = 'MadouFuto';

		// dinner-black
		const dinnerButton = document.createElement('button');
		dinnerButton.textContent = 'Dinner';
		dinnerButton.style.padding = '8px 15px';
		dinnerButton.style.backgroundColor = '#232323';
		dinnerButton.style.color = '#fff';
		dinnerButton.style.border = '1px solid #fff';
		dinnerButton.style.border = 'none';
		dinnerButton.style.fontFamily = 'MadouFuto';

		buttonContainer.appendChild(lunchButton);
		buttonContainer.appendChild(dinnerButton);

		lunchButton.addEventListener('click', function() {
			document.body.style.backgroundColor = '#EB9B2D';
			changeTextColor('#232323');

			lunchButton.style.backgroundColor = '#EB9B2D';
			lunchButton.style.color = '#ffffff';

			dinnerButton.style.backgroundColor = '#232323';
			dinnerButton.style.color = '#ccc';
		});

		dinnerButton.addEventListener('click', function() {
			document.body.style.backgroundColor = '#232323';
			changeTextColor('#fff');

			dinnerButton.style.backgroundColor = '#232323';
			dinnerButton.style.color = '#fff';
			dinnerButton.style.border = '1px solid #fff';
			
			lunchButton.style.backgroundColor = '#444';
			lunchButton.style.color = '#ccc';

		});

		function changeTextColor(color) {
			const textElements = document.querySelectorAll('a, #channel-title, #channel-title2, #channel-title3')

			textElements.forEach(element => {
				element.style.color = color;
			});

			const titles = document.querySelectorAll('#channel-title, #channel-title2');
			titles.forEach(title => {
				if (color === '#232323') {
					title.style.webkitTextStroke = '0.5px #232323';
				} else {
					title.style.webkitTextStroke = '0.5px #232323'
				}
				});
			}

		document.addEventListener('DOMContentLoaded', function() {
			document.body.appendChild(buttonContainer);
			dinnerButton.click();
		}
	)

	
// info

		document.getElementById("infoButton").addEventListener("click", function() {
		document.getElementById("infoModal").classList.add("active");
		});

		document.querySelector(".close-info").addEventListener("click", function() {
		document.getElementById("infoModal").classList.remove("active");
		});

		document.addEventListener("click", function(event) {
		if (event.target === document.getElementById("infoModal")) {
			document.getElementById("infoModal").classList.remove("active");
		}
		});



