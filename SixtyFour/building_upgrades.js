/*
 * Sixty-Four Mod: BuildingUpgrades
 *
 * https://sixtyfour.game-vault.net/wiki/Modding:Index
 * 
 * ----------------------------------------------
 *
 * REQUIRES THE MOD AUTOLOADER
 * See https://gist.github.com/NamelessCoder/26be6b5db7480de09f9dfb9e80dee3fe#file-_readme-md
 *
 * ----------------------------------------------
 *
 * Changes the game back to the original design where base structures have to be built before upgrades can be placed.
 * Optional setting to disable refunds for a more challenging experience.
 * 
 */
module.exports = class BuildingUpgrades extends Mod {
    label = 'BuildingUpgrades';
    description = 'Restores original game design requiring base structures to be built before upgrades can be placed.  Optional setting to disable refunds for a more challenging experience.';
    author = 'Brian Teague';
    version = '1.0.0';
    settings = {
        willRefund: {
            default: true,
            label: 'Refunds for upgrades',
            description: 'Refunds for upgrades will be given.  Uncheck to disable refunds for a more challenging experience.'
        }
    };

    getMethodReplacements() {

        const self = this;

        return [
            {
                class: Game,
                method: 'processMousemove',
                replacement: function (e, dxy, rightclick) {

                    const x = e?.offsetX || e?.clientX
                    const y = e?.offsetY || e?.clientY

                    if (e) {

                        this.updateMouseData(x, y)

                        if (e.buttons === 2) {
                            this.translation[0] -= e.movementX * this.pixelRatio / this.zoom
                            this.translation[1] -= e.movementY * this.pixelRatio / this.zoom
                        } else if (e.buttons === 1 && this.hoveredEntity) {

                            //DragFill
                            const n = this.hoveredEntity.name
                            const donotclick = (n === `cube` || n === `pump` || n === `pump2` || n === `waypoint` || n === `voidsculpture` || n === `strange` || n === `strange1` || n === `strange2` || n === `strange3` || n === `cookie` || n === `hollow`)
                            if (!this.itemInHand && !this.plane && !donotclick) {

                                this.hoveredEntity?.onmousedown()

                            }


                        } else if (dxy) {
                            this.translation[0] -= dxy[0]
                            this.translation[1] -= dxy[1]
                        }
                    }

                    const uv = this.xyToUV([this.mouse.offsetxy[0], this.mouse.offsetxy[1]])
                    const targetCell = [Math.floor(uv[0]), Math.floor(uv[1])]
                    this.hoveredCell = targetCell
                    this.hoveredEntity = this.entityAtCoordinates(this.hoveredCell)

                    this.hoveredResource = false
                    const delta = this.screenUnit * .3
                    for (let i = 0; i < this.resourceHomes.length; i++) {
                        const home = this.resourceHomes[i]
                        if (this.mouse.xy[0] > home[0] - delta && this.mouse.xy[0] < home[0] + delta && this.mouse.xy[1] > home[1] - delta && this.mouse.xy[1] < home[1] + delta) {
                            this.hoveredResource = i
                            break
                        }

                    }

                    if (this.plane === 1 && this.hoveredEntity?.ondarkhover) {
                        this.hoveredEntity.ondarkhover()
                    }

                    this.canPlace = false
                    if (this.itemInHand) {
                        const up = this.codex.entities[this.itemInHand.name].isUpgradeTo

                        const base = this.hoveredCell && this.canAfford(this.itemInHand.name)
                        const eraserOk = this.itemInHand.eraser && this.hoveredEntity && !this.hoveredEntity.indestructible && !(this.hoveredEntity instanceof Cube) && !((this.hoveredEntity instanceof Pump || this.hoveredEntity instanceof Gradient) && ((this.entitiesInGame[`pump`] || 0) + (this.entitiesInGame[`pump2`] || 0) + (this.entitiesInGame[`gradient`] || 0) < 2))
                        const newOk = !this.itemInHand.eraser && !this.hoveredEntity && !(up && this.codex.entities[up].onlyone) && !(up && (this.itemInHand.name === `flower` || this.itemInHand.name === `fruit`)) && !this.codex.entities[this.itemInHand.name].isUpgradeTo
                        const upgradeOk = this.hoveredEntity && !this.itemInHand.eraser && this.codex.entities[this.itemInHand.name]?.isUpgradeTo === this.hoveredEntity.name
                        this.canPlace = this.transportedEntity ? (!this.hoveredEntity || this.canRelocate(this.hoveredEntity)) : (base && (eraserOk || newOk || upgradeOk))
                    }

                }
            },
            {
                class: Game, // The class, NOT surrounded by quotes
                method: 'processMousemove2', // The method on the class, WITH quotes
                replacement: function (xy, dxy, click) {

                    //Conditioned update
                    if (xy) {
                        this.updateMouseData(xy[0], xy[1])
                        if (dxy && click === 2) {
                            this.translation[0] -= dxy[0]
                            this.translation[1] -= dxy[1]
                        } else if (this.hoveredEntity && click === 1) {
                            const n = this.hoveredEntity.name
                            const donotclick = (n === `cube` || n === `pump` || n === `pump2` || n === `waypoint` || n === `voidsculpture` || n === `strange` || n === `strange1` || n === `strange2` || n === `strange3` || n === `cookie` || n === `hollow`)
                            if (!this.itemInHand && !this.plane && !donotclick) {
                                this.hoveredEntity?.onmousedown()
                            }
                        }
                    }

                    //Conditionless update
                    const uv = this.xyToUV([this.mouse.offsetxy[0], this.mouse.offsetxy[1]])
                    const targetCell = [Math.floor(uv[0]), Math.floor(uv[1])]
                    this.hoveredCell = targetCell
                    this.hoveredEntity = this.entityAtCoordinates(this.hoveredCell)

                    this.hoveredResource = false
                    const delta = this.screenUnit * .3
                    for (let i = 0; i < this.resourceHomes.length; i++) {
                        const home = this.resourceHomes[i]
                        if (this.mouse.xy[0] > home[0] - delta && this.mouse.xy[0] < home[0] + delta && this.mouse.xy[1] > home[1] - delta && this.mouse.xy[1] < home[1] + delta) {
                            this.hoveredResource = i
                            break
                        }

                    }

                    if (this.plane === 1 && this.hoveredEntity?.ondarkhover) {
                        this.hoveredEntity.ondarkhover()
                    }

                    this.canPlace = false
                    if (this.itemInHand) {
                        const up = this.codex.entities[this.itemInHand.name].isUpgradeTo
                        const base = this.hoveredCell && this.canAfford(this.itemInHand.name)
                        const eraserOk = this.itemInHand.eraser && this.hoveredEntity && !this.hoveredEntity.indestructible && !(this.hoveredEntity instanceof Cube) && !((this.hoveredEntity instanceof Pump || this.hoveredEntity instanceof Gradient) && ((this.entitiesInGame[`pump`] || 0) + (this.entitiesInGame[`pump2`] || 0) + (this.entitiesInGame[`gradient`] || 0) < 2))
                        const newOk = !this.itemInHand.eraser && !this.hoveredEntity && !(up && this.codex.entities[up].onlyone) && !(up && (this.itemInHand.name === `flower` || this.itemInHand.name === `fruit`)) && !this.codex.entities[this.itemInHand.name].isUpgradeTo
                        const upgradeOk = this.hoveredEntity && !this.itemInHand.eraser && this.codex.entities[this.itemInHand.name]?.isUpgradeTo === this.hoveredEntity.name
                        this.canPlace = this.transportedEntity ? (!this.hoveredEntity || this.canRelocate(this.hoveredEntity)) : (base && (eraserOk || newOk || upgradeOk))
                    }

                }
            },
            {
                class: Game, // The class, NOT surrounded by quotes
                method: 'processClick', // The method on the class, WITH quotes
                replacement: function () {


                    const ok = this.itemInHand && this.hoveredCell && this.canAfford(this.itemInHand.name) && !(this.itemInHand.eraser && (this.hoveredEntity instanceof Pump || this.hoveredEntity instanceof Gradient) && ((this.entitiesInGame[`pump`] || 0) + (this.entitiesInGame[`pump2`] || 0) + (this.entitiesInGame[`gradient`] || 0) < 2))

                    if (this.transportedEntity && this.hoveredCell && this.resources[4] >= 1) {

                        //Relocation
                        this.requestResources([0, 0, 0, 0, 1], this.hoveredCell, false, true)
                        this.relocate(this.transportedEntity, this.hoveredCell)
                        delete this.transportedEntity
                        delete this.itemInHand

                    } else if (ok) {
                        // const entityHere = this.entityAtCoordinates(this.hoveredCell)

                        //Just your regular item placement
                        const up = this.codex.entities[this.itemInHand.name].isUpgradeTo
                        if (!this.hoveredEntity && !this.itemInHand.eraser && !this.codex.entities[this.itemInHand.name].isUpgradeTo) {
                            // if (!this.hoveredEntity && !this.itemInHand.eraser && !(up && this.codex.entities[up].onlyone) && !(up && (this.itemInHand.name === `flower` || this.itemInHand.name === `fruit`))) {

                            const price = this.getRealPrice(this.itemInHand.name)

                            this.requestResources(price, this.hoveredCell, false, true)

                            this.addEntity(this.itemInHand.name, this.hoveredCell)

                            //SFX
                            const screenxy = this.uvToXYUntranslated(this.hoveredCell)
                            const pan = this.getPanValueFromX(screenxy[0])
                            this.playSound(`place`, pan)

                            this.stats.machinesBuild++
                            if (this.shop.mobileToggle) this.shop.mobileToggle.classList.remove(`active`)
                            this.processMousemove2()

                            if (this.codex.entities[this.itemInHand.name].onlyone) {
                                this.onlyones[this.itemInHand.name] = true
                                this.shop.check()
                                delete this.itemInHand
                            } else if (!this.canAfford(this.itemInHand?.name)) {
                                delete this.itemInHand
                            } else {
                                this.pickupItem(this.itemInHand.name)
                            }

                            //Erasing
                        } else if (this.hoveredEntity && this.itemInHand.eraser && !(this.hoveredEntity instanceof Cube) && !this.hoveredEntity.indestructible) {

                            //REFUND
                            const price = this.getRealPrice(this.hoveredEntity.name, true)
                            const xy = this.uvToXYUntranslated(this.hoveredCell)

                            if (this.codex.entities[this.hoveredEntity.name].onlyone) {

                                let chainElement = this.codex.entities[this.hoveredEntity.name]
                                while (chainElement.isUpgradeTo) {
                                    delete this.onlyones[chainElement.isUpgradeTo]
                                    chainElement = this.codex.entities[chainElement.isUpgradeTo]
                                }

                                if (this.codex.entities[this.hoveredEntity.name].isUpgradeTo) {
                                    delete this.onlyones[this.codex.entities[this.hoveredEntity.name].isUpgradeTo]
                                }

                                delete this.onlyones[this.hoveredEntity.name]
                                this.shop.check()

                            }

                            if (self.configuredOptions.willRefund) {
                                this.createResourceTransfer(price, xy, undefined, undefined, undefined, true)
                            }

                            //SFX
                            const pan = this.getPanValueFromX(xy[0])
                            this.playSound(`recycle`, pan)

                            this.requestResources(this.getRealPrice(this.itemInHand.name), this.hoveredCell, false, true) //just the cost of erasing
                            this.clearCell(this.hoveredCell)
                            this.stats.machinesSold++
                            this.stats.timeSinceLastDelete = 0
                            this.hoveredEntity = undefined

                            //Upgrading
                        } else if (this.hoveredEntity && !this.itemInHand.eraser && this.codex.entities[this.itemInHand.name]?.isUpgradeTo === this.hoveredEntity.name) {

                            if (this.itemInHand.name === `pinhole`) {
                                this.saveGame()
                                this.preventSaving = true
                            }

                            this.clearCell(this.hoveredCell)
                            if (this.itemInHand.name !== `pinhole`) this.stats.timeSinceLastDelete = 0

                            const price = this.getRealPrice(this.itemInHand.name)
                            const refund = this.getRealPrice(this.hoveredEntity.name)

                            if (self.configuredOptions.willRefund) {
                                this.createResourceTransfer(refund, this.uvToXYUntranslated(this.hoveredCell), undefined, undefined, undefined, true)
                            }
                            this.requestResources(price, this.hoveredCell, _ => { }, true)
                            this.addEntity(this.itemInHand.name, this.hoveredEntity.position)

                            //SFX
                            const screenxy = this.uvToXYUntranslated(this.hoveredEntity.position)
                            const pan = this.getPanValueFromX(screenxy[0])
                            this.playSound(`place`, pan)

                            this.stats.machinesBuild++
                            if (this.shop.mobileToggle) this.shop.mobileToggle.classList.remove(`active`)
                            if (this.codex.entities[this.itemInHand.name].onlyone) {
                                this.onlyones[this.itemInHand.name] = true
                                delete this.itemInHand
                            } else if (!this.canAfford(this.itemInHand?.name)) {
                                delete this.itemInHand
                            } else {
                                this.pickupItem(this.itemInHand.name) // to update the price
                            }
                            this.shop.check()
                            // delete this.hoveredCell

                            //Cancel build mode if click on machine
                        } else if (this.itemInHand && this.hoveredEntity?.name !== `cube`) {
                            delete this.itemInHand
                            if (this.shop.mobileToggle) this.shop.mobileToggle.classList.remove(`active`)
                        }
                    }

                }
            }
        ];
    };
};
