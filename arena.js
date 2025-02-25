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
		// buttonGrid.style.transform = 'translate(-50%, -50%)';

		let buttonCount = 0;

	// Hide some assets
		blocks.forEach((block, index) => {
			if (block.title && block.title.includes('Japanese TV commercial')) {
				return;
			}

			if (buttonCount >= 24){
				return;
			}

			const button = document.createElement('button');
			button.className = 'vending-button';
			button.innerHTML = "";
			button.addEventListener('click', () => showModal(block));
			buttonGrid.appendChild(button);

			buttonCount++;
		});
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
					<audio controls src="${ block.attachment.url }" style="max-width: 100%"></audio>
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
			content =
				`
					<h3>${ block.title || 'Video'}</h3>
					<p><em>Linked Video</em></p>
					${ block.embed.html }
					${block.description_html || ''}
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





