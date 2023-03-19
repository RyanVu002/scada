<!-- eslint-disable no-mixed-spaces-and-tabs -->
<template>
	<div id="app">
		<div class="view login" v-if="state.username === '' || state.username === null">
			<form class="login-form"  @submit.prevent="Login">
				<div class="form-inner">
				<h1>Login to SCADA data live data</h1>
				<label for="username">Username</label>
				<input 
					type="text" 
					v-model="inputUsername" 
					placeholder="Please enter your username..." />
				<input 
					type="submit" 
					value="Login" />
				</div>
			</form>
		</div>
  
		<div class="view chat" v-else>
			<header>
				<div class="d-flex justify-content-between">
					<h1>Welcome, {{ state.username }}</h1>
					<button type="button" class="btn btn-danger float-right" @click="Logout">Logout</button>
				</div>
			</header>
			
			<section class="chat-box">
				<div class="row">
					<div class="col-2 vstack gap-3 p-3">
						<h3>Pump</h3>
						<button class="btn" :class="valve_1_active ? 'btn-success' : 'btn-outline-success'" value="valve_1_active" @click="setStatus($event)">Valve #1</button>
						<button class="btn" :class="valve_2_active ? 'btn-success' : 'btn-outline-success'" value="valve_2_active" @click="setStatus($event)">Valve #2</button>
						<button class="btn" :class="valve_3_active ? 'btn-success' : 'btn-outline-success'" value="valve_3_active" @click="setStatus($event)">Valve #3</button>
						<button class="btn" :class="valve_4_active ? 'btn-success' : 'btn-outline-success'" value="valve_4_active" @click="setStatus($event)">Valve #4</button>
					</div>
					<div class="col-2 vstack gap-3 p-3">
						<h3>Release</h3>
						<button class="btn" :class="release_1_active ? 'btn-success' : 'btn-outline-success'" value="release_1_active" @click="setStatus($event)">Release #1</button>
						<button class="btn" :class="release_2_active ? 'btn-success' : 'btn-outline-success'" value="release_2_active" @click="setStatus($event)">Release #2</button>
						<button class="btn" :class="release_3_active ? 'btn-success' : 'btn-outline-success'" value="release_3_active" @click="setStatus($event)">Release #3</button>
						<button class="btn" :class="release_4_active ? 'btn-success' : 'btn-outline-success'" value="release_4_active" @click="setStatus($event)">Release #4</button>
					</div>
					<div class="col-4 p-3 d-flex justify-content-center">
						<div>
							<h3 class="d-flex justify-content-center">Power</h3>
							<vue-gauge :refid="'type-unique-id-1'" :options="gaugeOptions" :key="gaugeValue"></vue-gauge>
							<h3 class="d-flex justify-content-center">Tank</h3>
							<vue-gauge :refid="'type-unique-id-2'" :options="gaugeOptions" :key="gaugeValue"></vue-gauge>
						</div>
						<div>
							
						</div>
					</div>
					<div class="col-4">
						<h3 class="d-flex justify-content-center">Back log</h3>
						<div class="chat-box">
							<div v-if="backlogData.length != 0">
								<div 
									v-for="data in backlogData" 
									:key="data.key"
									class="message">
									<div class="message-inner">
										<div class="content">{{ data.username }} modified at {{ data.modifiedAt }} action with {{ data.actionWith }}</div>
									</div>
								</div>
							</div>
							<div v-else><h3>NO DATA</h3></div>
						</div>
					</div>
				</div>
			</section>

			<section class="chat-box chat-overflow">
				<div 
					v-for="message in state.messages" 
					:key="message.key" 
					:class="(message.username == state.username ? 'message current-user' : 'message')">
					<div class="message-inner">
						<div class="username">{{ message.username }}</div>
						<div class="content">{{ message.content }}</div>
					</div>
				</div>
			</section>
		
			<footer>
				<form @submit.prevent="SendMessage">
				<input 
					type="text" 
					v-model="inputMessage" 
					placeholder="Write a message..." />
				<input 
					type="submit" 
					value="Send" />
				</form>
			</footer>
		</div>
	</div>
</template>

<script>
import { reactive, onMounted, ref } from 'vue';
import db from './db';
import VueGauge from 'vue-gauge';
import moment from 'moment';

export default {
	components: { VueGauge },
	data() {
		return {
			gaugeValue: 0,
			valveReleaseList: [
				"valve_1_active",
				"valve_2_active",
				"valve_3_active",
				"valve_4_active",
				"release_1_active",
				"release_2_active",
				"release_3_active",
				"release_4_active",
			],
			backlog: [],
			valve_1_active: false,
			valve_2_active: false,
			valve_3_active: false,
			valve_4_active: false,
			release_1_active: false,
			release_2_active: false,
			release_3_active: false,
			release_4_active: false
		}
	},
	computed: {
		gaugeOptions() {
			return {
				hasNeedle: true,
				needleValue: this.gaugeValue,
				needleColor: 'black',
				arcColors: [
				'rgb(61, 204, 91)',
				'rgb(239, 214, 19)',
				'rgb(255,165,0)',
				'rgb(255, 84, 84)',
				],
				arcDelimiters: [25, 50, 75],
				rangeLabel: ['0', '100'],
				arcOverEffect: false,
				needleStartValue: this.gaugeValue,
				centralLabel: this.gaugeValue.toString(),
			}
		},
		backlogData() {
			return this.backlog.length < 5 ? this.backlog : this.backlog.slice(1).slice(-5);
		}
	},
	mounted() {
		const backlogRef = db.database().ref("backlog");
		backlogRef.on('value', snapshot => {
			const data = snapshot.val() ?? "";
			let backlog = [];
			Object.keys(data).forEach(key => {
			backlog.push({
				id: key,
				username: data[key].username,
				actionWith: data[key].actionWith,
				modifiedAt: data[key].modifiedAt
			});
			});
			this.backlog = backlog;
		});

		this.valveReleaseList.forEach(el => {
			const elRef = db.database().ref(el);
			elRef.on('value', snapshot => {
				const data = snapshot.val() ?? "";
				let backlog = [];
				Object.keys(data).forEach(key => {
					backlog.push({
						id: key,
						username: data[key].username,
						status: data[key].status
					});
				});
				this[el] = backlog.pop()?.status ?? false;
			});
		})
	},
	methods: {
		setStatus(e) {
			this[e.target.value] = !this[e.target.value];
			var current = moment().format("DD/MM/YYYY hh:mm:ss a").toString();
			const statusRef = db.database().ref(e.target.value.toString());
			const status = {
				username: this.state.username,
				status: this[e.target.value],
				modifiedAt: current
			}
			statusRef.push(status);
			this.saveBacklog(e.target.innerHTML.toString(), current);
		},
		saveBacklog(actionWith, current) {
			const logRef = db.database().ref("backlog");
			const log = {
				username: this.state.username,
				actionWith: actionWith,
				modifiedAt: current
			}
			logRef.push(log);
		}
	},
	//
	setup() {
		const inputUsername = ref("");
		const inputMessage = ref("");

		const state = reactive({
			username: "",
			messages: []
		});

		const Login = () => {
			if (inputUsername.value != "" || inputUsername.value != null) {
				state.username = inputUsername.value;
				inputUsername.value = "";
			}
		}

		const Logout = () => {
			state.username = "";
		}

		const SendMessage = () => {
		const messagesRef = db.database().ref("messages");

		if (inputMessage.value === "" || inputMessage.value === null) {
			return;
		}

		const message = {
			username: state.username,
			content: inputMessage.value
		}

		messagesRef.push(message);
			inputMessage.value = "";
		}

		onMounted(() => {
			const messagesRef = db.database().ref("messages");
			messagesRef.on('value', snapshot => {
				const data = snapshot.val() ?? "";
				let messages = [];
				Object.keys(data).forEach(key => {
				messages.push({
					id: key,
					username: data[key].username,
					content: data[key].content
				});
				});
				state.messages = messages;
			});
		});

		return {
			inputUsername,
			Login,
			state,
			inputMessage,
			SendMessage,
			Logout
		}
	}
}
</script>

<style lang="scss">
	* {
		font-family: Avenir, Helvetica, Arial, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;

		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	.view {
		display: flex;
		justify-content: center;
		min-height: 100vh;
		background-color: #6c757d ;
		
		&.login {
			align-items: center;
			.login-form {
				display: block;
				width: 100%;
				padding: 15px;
				
				.form-inner {
					display: block;
					background-color: #FFF;
					padding: 50px 15px;
					border-radius: 16px;
					box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.2);

					h1 {
						color: #AAA;
						font-size: 28px;
						margin-bottom: 30px;
					}

					label {
						display: block;
						margin-bottom: 5px;
						color: #AAA;
						font-size: 16px;
						transition: 0.4s;
					}

					input[type="text"] {
						appearance: none;
						border: none;
						outline: none;
						background: none;

						display: block;
						width: 100%;
						padding: 10px 15px;
						border-radius: 8px;
						margin-bottom: 15px;
						
						color: #333;
						font-size: 18px;

						box-shadow: 0px 0px 0px rgba(0, 0, 0, 0);
						background-color: #F3F3F3;

						transition: 0.4s;

						&::placeholder {
							color: #888;
							transition: 0.4s;
						}
					}

					input[type="submit"] {
						appearance: none;
						border: none;
						outline: none;
						background: none;

						display: block;
						width: 100%;
						padding: 10px 15px;
						background-color: #ea526f;
						border-radius: 8px;

						color: #FFF;
						font-size: 18px;
						font-weight: 700;
					}

					&:focus-within {
						label {
							color: #ea526f;
						}

						input[type="text"] {
							background-color: #FFF;
							box-shadow: 0 0 6px rgba(0, 0, 0, 0.2);

							&::placeholder {
								color: #666;
							}
						}
					}
				}
			}
		}

		&.chat {
			flex-direction: column;

			header {
				position: relative;
				display: block;
				width: 100%;
				padding: 50px 30px 10px;

				.logout {
					position: absolute;
					top: 15px;
					right: 15px;
					appearance: none;
					border: none;
					outline: none;
					background: none;
					
					color: #FFF;
					font-size: 18px;
					margin-bottom: 10px;
					text-align: right;
				}

				h1 {
					color: #FFF;
				}
			}

			.chat-box {
				border-radius: 24px;
				background-color: #FFF;
				box-shadow: 0px 0px 12px rgba(100, 100, 100, 0.2);
				flex: 1 1 100%;
				padding: 30px;
				margin: 30px;
				.message {
					display: flex;
					margin-bottom: 15px;
					
					.message-inner {
						.username {
							color: #888;
							font-size: 16px;
							margin-bottom: 5px;
							padding-left: 15px;
							padding-right: 15px;
						}

						.content {
							display: inline-block;
							padding: 10px 20px;
							background-color: #F3F3F3;
							border-radius: 999px;

							color: #333;
							font-size: 18px;
							line-height: 1.2em;
							text-align: left;
						}
					}

					&.current-user {
						margin-top: 30px;
						justify-content: flex-end;
						text-align: right;

						.message-inner {
							max-width: 75%;

							.content {
								color: #FFF;
								font-weight: 600;
								background-color: #ea526f;
							}
						}
					}
				}
			}

			.chat-overflow {
			max-height: 500px;
            overflow:auto;
			}

			footer {
				position: sticky;
				bottom: 0px;
				background-color: #FFF;
				padding: 30px;
				box-shadow: 0px 0px 12px rgba(100, 100, 100, 0.2);

				form {
					display: flex;

					input[type="text"] {
						flex: 1 1 100%;

						appearance: none;
						border: none;
						outline: none;
						background: none;

						display: block;
						width: 100%;
						padding: 10px 15px;
						border-radius: 8px 0px 0px 8px;
						
						color: #333;
						font-size: 18px;

						box-shadow: 0px 0px 0px rgba(0, 0, 0, 0);
						background-color: #F3F3F3;

						transition: 0.4s;

						&::placeholder {
							color: #888;
							transition: 0.4s;
						}
					}
					
					input[type="submit"] {
						appearance: none;
						border: none;
						outline: none;
						background: none;

						display: block;
						padding: 10px 15px;
						border-radius: 0px 8px 8px 0px;

						background-color: #ea526f;

						color: #FFF;
						font-size: 18px;
						font-weight: 700;
					}
				}
			}
		}
	}

	.btn {
	cursor: pointer;
	outline: 0;
	display: inline-block;
	font-weight: 400;
	line-height: 1.5;
	text-align: center;
	border: 1px solid #fff;
	padding: 6px 12px;
	font-size: 1rem;
	border-radius: 1.25rem;
	transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;
	color: #0d6efd;
	border-color: #0d6efd;
	}

	.btn:hover {
	color: #fff;
	background-color: #0d6efd;
	border-color: #0d6efd;
	}

	.active {
	color: #fff;
	background-color: #0d6efd;
	border-color: #0d6efd;
	}

	#app {
	font-family: 'Avenir', Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	}

	@import'~bootstrap/dist/css/bootstrap.css'
</style>